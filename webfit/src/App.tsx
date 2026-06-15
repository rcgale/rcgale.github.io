import {useEffect, useState} from "react";
import Button from 'react-bootstrap/Button';

type Distribution = [number, number, number, number, number, number]
type DistributionPair = [Distribution, Distribution];
type FlatDistributionPair = [...Distribution, ...Distribution];
type Parameters = [number, number, number];
type MapData = [Parameters, DistributionPair][];

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import {Col, Container, Row} from "react-bootstrap";


const MAP_FILE_URL = "/webfit/map-0.20.json";
const TINY = 1e-9;

interface Boundaries {
    sMin: number
    sMax: number
    pMin: number
    pMax: number
    decayMin: number
    decayMax: number
}


interface InputFormProps {
    inputs: DistributionPair
    labels: string[]
    setInputs: (inputs: DistributionPair) => void
}

function InputForm({inputs, labels, setInputs}: InputFormProps) {
    const timeSteps = ["1s", "5s"];

    function setValue(rowIdx: number, valueIdx: number, value: number) {
        const inputsCopy = structuredClone(inputs);
        inputsCopy[rowIdx][valueIdx] = value;
        setInputs(inputsCopy);
    }

    function onPaste(rowIdx: number, valueIdx: number, text: string) {
        const inputsCopy = structuredClone(inputs);
        let values = text.trim().split(/\s+/).map(s => parseFloat(s));
        if (valueIdx !== 0 || values.length <= 1 || values.filter(isNaN).length > 0) {
            return true;
        }
        values.forEach((value, i) => {
            if (i > 5 && rowIdx !== 0) return;
            let updateValue = i % 6;
            let updateRow = i === updateValue ? rowIdx : rowIdx + 1;
            inputsCopy[updateRow][updateValue] = value;
        });
        setInputs(inputsCopy);
    }

    return (
        <table>
            <thead>
            <tr>
                <th>Time</th>
                {labels.map((label, idx) =>
                    <th key={idx}>{label}</th>
                )}
            </tr>
            </thead>
            <tbody>
            {inputs.map((row, rowIdx) =>
                <tr key={rowIdx}>
                    <td style={{verticalAlign: "middle"}}>
                        {timeSteps[rowIdx]}
                    </td>
                    {row.map((value, valueIdx) =>
                        <td key={valueIdx}>
                            <input type="text"
                                   inputMode="numeric"
                                   pattern="\d*"
                                   style={{width: "5em"}}
                                   defaultValue={Number.isNaN(value) ? "" : value}
                                   onChange={(ev) => setValue(rowIdx, valueIdx, parseFloat(ev.target.value))}
                                   onPaste={(ev) => {
                                       ev.currentTarget.blur();
                                       onPaste(rowIdx, valueIdx, ev.clipboardData.getData('text/plain'));
                                   }}
                            />
                        </td>
                    )}
                </tr>
            )}
            </tbody>
        </table>
    );
}


interface BoundariesFormProps {
    boundaries: Boundaries
    totalDataPoints: number
    filteredDataPoints: number
    setBoundaries: (boundaries: Boundaries) => void
}

function BoundariesForm({boundaries, totalDataPoints, filteredDataPoints, setBoundaries}: BoundariesFormProps) {
    const step = 1e-5;

    const rangePairs = [
        {parameter: "S", limit: 0.04, minVar: "sMin" as keyof Boundaries, maxVar: "sMax" as keyof Boundaries,},
        {parameter: "P", limit: 0.04, minVar: "pMin" as keyof Boundaries, maxVar: "pMax" as keyof Boundaries,},
        {parameter: "Decay", limit: 1.0, minVar: "decayMin" as keyof Boundaries, maxVar: "decayMax" as keyof Boundaries,},
    ]
    function updateBoundary(key: keyof Boundaries, newValue: number) {
        if (boundaries[key] == newValue) return;
        const updated = structuredClone(boundaries);
        updated[key] = newValue;
        setBoundaries(updated)
    }

    return (
        <table>
            <tbody>
                <tr>
                  <td>Map points included:</td>
                  <td>{filteredDataPoints.toLocaleString()}</td>
                  <td>Map points excluded:</td>
                  <td>{(totalDataPoints - filteredDataPoints).toLocaleString()}</td>
                </tr>
                {rangePairs.map(({parameter, limit, minVar, maxVar}) => {

                    let minValue = boundaries[minVar];
                    let maxValue = boundaries[maxVar];

                    return <tr key={parameter}>
                        <td>
                            {parameter} min:
                        </td>
                        <td>
                            <input type="number"
                                   value={minValue || TINY}
                                   min={0.0}
                                   max={maxValue}
                                   step={step}
                                   style={{width: "8em"}}
                                   onChange={(ev) =>
                                       updateBoundary(minVar, parseFloat(ev.target.value) || TINY)
                                   }
                            />
                        </td>
                        <td>
                            {parameter} max:
                        </td>
                        <td>
                            <input type="number"
                                   value={maxValue || TINY}
                                   min={0.0}
                                   max={limit}
                                   step={step}
                                   onChange={(ev) =>
                                       updateBoundary(maxVar, Math.max(minValue, parseFloat(ev.target.value)))
                                   } />
                       </td>
                    </tr>
                })}
            </tbody>
        </table>
    );
}

interface ResultItem {
    distributions: DistributionPair
    s: number
    p: number
    decay: number
}

interface NBestResults {
    target: DistributionPair
    bestItems: NBest<ResultItem>
}

interface ResultParamsProps {
    s: number
    p: number
    decay: number
    score: number
    labels: string[]
}

function ResultParams({s, p, decay, score}: ResultParamsProps) {
    function formatNumber(x: number, digits: number = 18) {
        return x.toLocaleString(undefined, {maximumFractionDigits: digits})
    }

    return (
        <table className="fit-result-parameters">
            <thead>
                <tr>
                    <th>S</th>
                    <th>P</th>
                    <th>Decay</th>
                    <th>RMSD</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>{formatNumber(s)}</td>
                    <td>{formatNumber(p)}</td>
                    <td>{formatNumber(decay)}</td>
                    <td>{score.toFixed(4)}</td>
                </tr>
            </tbody>
        </table>
    );
}

interface ResultDistProps {
    target: DistributionPair
    distributions: DistributionPair
    labels: string[]
}

function ResultDist({target, distributions, labels}: ResultDistProps) {
    const timeStepsInput = ["1s", "5s"];
    const timeStepsOutput = ["ts=8", "ts=25"];
    const separateScores = [
        rmsd(distributions[0], target[0]),
        rmsd(distributions[1], target[1]),
    ];
    return (
        <table>
            <thead style={{borderTop: "1.4em solid transparent"}}>
                <tr>
                    <th>Time</th>
                    {labels.map((label, idx) =>
                        <th key={idx} v-for="label in labels">
                            {label}
                        </th>
                    )}
                    <th>RMSD</th>
                </tr>
            </thead>
            {target.map((row, rowIdx) =>
                <tbody key={rowIdx} style={{borderTop: "1.4em solid transparent"}}>
                    <tr>
                        <td>
                            {timeStepsInput[rowIdx]}
                        </td>
                        {row.map((value, valueIdx) =>
                            <td key={valueIdx}>
                                {!Number.isNaN(value) &&
                                    <><span style={{fontStyle: "italic"}}>{value.toFixed(4)}</span>&nbsp;</>
                                }
                            </td>
                        )}
                        <td rowSpan={2} style={{verticalAlign: "middle"}}>
                            {separateScores[rowIdx].toFixed(4)}
                        </td>
                    </tr>
                    <tr>
                        <td>
                            {timeStepsOutput[rowIdx]}
                        </td>
                        {distributions[rowIdx].map((value, valueIdx) =>
                            <td key={valueIdx}>
                                {value?.toFixed(4)}
                            </td>
                        )}
                    </tr>
                </tbody>
            )}
        </table>
    );
}

class MapFileService {
    static async load(url: string): Promise<MapData> {
        const response = await fetch(url);
        const text = await response.text();
        return await JSON.parse(text);
    }
}

interface ResultsDisplayProps {
    inputs: DistributionPair
    labels: string[]
    mapData: MapData
    filteredMapData: MapData
}

function ResultsDisplay({inputs, labels, mapData, filteredMapData}: ResultsDisplayProps) {
    const [normalize, setNormalize] = useState(true);
    const [results, setResults] = useState<NBestResults>();
    const [nBest, setNBest] = useState(10);

    const target = normalize
        ? inputs.map(getNormalized) as DistributionPair
        : inputs;

    const ready = mapData && sum(target[0]) > 0 && sum(target[1]) > 0;
    const resultsCurrent = results && JSON.stringify(results.target) == JSON.stringify(target);

    function fit() {
        setResults(undefined)
        // const target = target.map(row => [...row]);
        doFit(filteredMapData, target, nBest).then(setResults)
    }

    const className = resultsCurrent && "current" || "";

    return (
        <div>
            <Container>
                <Row className="fit-submit-row">
                    <Col xs={6}>
                        Show &nbsp;
                        <input type="number"
                               style={{width:"3em"}}
                               defaultValue={nBest}
                               onChange={(ev) => setNBest(parseFloat(ev.target.value))}
                               />
                        &nbsp; best matches
                    </Col>
                    <Col xs={5}>
                        <input id="checkbox-normalize"
                               type="checkbox"
                               defaultChecked={normalize}
                               onChange={(ev) => setNormalize(ev.target.checked)}/>
                        <label htmlFor="checkbox-normalize">Normalize input</label>
                    </Col>
                    <Col xs={1} className="text-end">
                        <Button disabled={!ready} onClick={() => fit()}>Fit</Button>
                    </Col>
                </Row>
            </Container>
            {results && resultsCurrent && <div className={`fit-results ${className}`}>
                    {results.bestItems.map(({score, item}, resultIdx) => {
                        const {s, p, decay, distributions} = item;
                        return <div key={resultIdx} className="fit-result">
                            <h4>Result #{1 + resultIdx}</h4>
                            <ResultParams s={s} p={p} decay={decay} score={score} labels={labels}/>
                            <ResultDist target={target}
                                        distributions={distributions}
                                        labels={labels}/>
                        </div>
                    })}
            </div>}
        </div>
    );
}

function FormDist() {
    const [mapData, setMapData] = useState<MapData>([]);
    const [filteredMapData, setFilteredMapData] = useState<MapData>([]);
    const [inputs, setInputs] = useState<DistributionPair>([
        [NaN, NaN, NaN, NaN, NaN, NaN],
        [NaN, NaN, NaN, NaN, NaN, NaN]
    ]);
    const [boundaries, setBoundaries] = useState(
        {sMin: TINY, sMax: 0.04, pMin: TINY, pMax: 0.04, decayMin: TINY, decayMax: 1.0}
    );
    const labels = ["Correct", "Semantic", "Formal", "Mixed", "Unrelated", "Nonword"]

    useEffect(() => {
        MapFileService.load(MAP_FILE_URL).then(setMapData)
    }, []);

    useEffect(() => {
        if (!mapData.length) return;
        const handler = setTimeout(() => updateFilteredMapData(), 0);
        return () => clearTimeout(handler);
    }, [mapData, boundaries])

    function updateFilteredMapData() {
        console.log({starting: true, ...boundaries});
        const {sMin, sMax, pMin, pMax, decayMin, decayMax} = boundaries;
        const filteredMapData = mapData.filter(([[s, p, decay], _]) =>
            sMin <= s && s <= sMax
            && pMin <= p && p <= pMax
            && decayMin <= decay && decay <= decayMax
        );
        setFilteredMapData(filteredMapData);
        console.log({done: true, ...boundaries});
    }

    return (
        (mapData === undefined || filteredMapData === undefined)
            ? <div>Loading...</div>
            : <div>
                    <div>
                        <h2>Boundaries</h2>
                        <BoundariesForm boundaries={boundaries}
                                        setBoundaries={setBoundaries}
                                        totalDataPoints={mapData.length}
                                        filteredDataPoints={filteredMapData.length}
                        />
                    </div>
                    <div>
                        <h2>Observations</h2>
                        <InputForm inputs={inputs} labels={labels} setInputs={setInputs} />
                    </div>
                    {inputs && <ResultsDisplay inputs={inputs}
                                               labels={labels}
                                               mapData={mapData}
                                               filteredMapData={filteredMapData}
                    />}
                    <p style={{textAlign: "center", fontStyle: "italic", marginTop: "1em"}}>
                        full map file at <a href={MAP_FILE_URL} target="_blank">{MAP_FILE_URL}</a>
                    </p>
                </div>
    );
}


export default function App() {
    return <FormDist></FormDist>
}

function rmsd(x1: number[], x2: number[]) {
    return Math.sqrt(mean(x1.map((_, i) => Math.pow(x1[i] - x2[i], 2))));
}

function mean(x: number[]) {
    return sum(x) / x.length;
}

function sum(items: number[]) {
    return items.reduce((a, x) => a + x, 0.0);
}

class NBest<T> extends Array<{score: number, item: T}> {

    constructor(n: number, ...items: {score: number, item: T}[]) {
        super();
        this.n = n;
        this.update(...items);
    }

    n: number

    update(...items: {score: number, item: T}[]) {
        for (const {score, item} of items) {
            const threshold = this.at(this.length - 1)?.score;
            if (threshold === undefined || score < threshold) {
                const idx = this.findIndex(x => x.score > score);
                this.splice(idx, 0, {score, item})
                while (this.length > this.n) {
                    this.pop()
                }
            }
        }
    }
}

function getNormalized(row: Distribution): Distribution {
    const total = sum(row)
    return row.map(x => (x / total)) as Distribution;
}

async function doFit(data: MapData, target: DistributionPair, nBest: number): Promise<NBestResults> {
    const flatten = (d: DistributionPair) => (d.flatMap(x => x) as FlatDistributionPair)
    const flatTarget = flatten(target);
    const withRmsd = data.map(([[s, p, decay], distributions]) => ({
        item: {s, p, decay, distributions},
        score: rmsd(flatten(distributions), flatTarget)
    }));
    const bestItems = new NBest(nBest, ...withRmsd);
    return {target, bestItems}
}