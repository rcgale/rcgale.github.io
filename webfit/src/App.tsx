import {useEffect, useState} from "react";

type Distribution = [number, number, number, number, number, number]
type DistributionPair = [Distribution, Distribution];
type FlatDistributionPair = [...Distribution, ...Distribution];
type Parameters = [number, number, number];
type MapData = [Parameters, DistributionPair][];


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

interface Result {
    target: DistributionPair
    s: number
    p: number
    decay: number
    distributions: DistributionPair
    rmsd: {separate: [number, number], combined: number}
}

interface ResultParamsProps {
    result: Result
    labels: string[]
}

function ResultParams({result}: ResultParamsProps) {
    function formatNumber(x: number, digits: number = 18) {
        return x.toLocaleString(undefined, {maximumFractionDigits: digits})
    }

    return (
        <table>
            <thead>
                <tr>
                    <th>S</th>
                    <th>P</th>
                    <th>Decay</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>{formatNumber(result.s)}</td>
                    <td>{formatNumber(result.p)}</td>
                    <td>{formatNumber(result.decay)}</td>
                </tr>
            </tbody>
        </table>
    );
}

interface ResultDistProps {
    result: Result
    labels: string[]
}

function ResultDist({result, labels}: ResultDistProps) {
    const timeStepsInput = ["1s", "5s"];
    const timeStepsOutput = ["ts=8", "ts=25"];
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
            {result.target.map((row, rowIdx) =>
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
                            {result.rmsd.separate[rowIdx].toFixed(4)}
                        </td>
                    </tr>
                    <tr>
                        <td>
                            {timeStepsOutput[rowIdx]}
                        </td>
                        {result.distributions[rowIdx].map((value, valueIdx) =>
                            <td key={valueIdx}>
                                {value?.toFixed(4)}
                                {/*<span v-if="!Number.isNaN(value)">{value.toFixed(4)}</span>&nbsp;*/}
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
    const [result, setResult] = useState<Result>();

    const target = normalize
        ? inputs.map(getNormalized) as DistributionPair
        : inputs;

    const ready = mapData && sum(target[0]) > 0 && sum(target[1]) > 0;
    const resultsCurrent = result && JSON.stringify(result.target) == JSON.stringify(target);

    function fit() {
        setResult(undefined)
        // const target = target.map(row => [...row]);
        doFit(filteredMapData, target).then(setResult)
    }

    const className = resultsCurrent && "current" || "";

    return (
            <div>
                <div>
                    <input id="checkbox-normalize"
                           type="checkbox"
                           defaultChecked={normalize}
                           onChange={(ev) => setNormalize(ev.target.checked)}/>
                    <label htmlFor="checkbox-normalize">Normalize input</label>
                </div>
                <button disabled={!ready} onClick={() => fit()}>Fit</button>
                {result &&
                    <div className={className}>
                        <h3>Results</h3>
                        <ResultParams result={result} labels={labels} />
                        <ResultDist result={result} labels={labels} />
                    </div>
                }
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

function min<T>(iterable: T[], key: (item: T) => number) {
    let [_, best] =  iterable.reduce(([bestScore, bestItem], item) => {
        let score = key(item);
        return Number.isNaN(bestScore) || (score < bestScore)
            ? [score, item]
            : [bestScore, bestItem];
    }, [NaN, undefined] as [number, T]);
    return best;
}

function getNormalized(row: Distribution): Distribution {
    const total = sum(row)
    return row.map(x => (x / total)) as Distribution;
}

async function doFit(data: MapData, target: DistributionPair): Promise<Result> {
    const flatten = (d: DistributionPair) => (d.flatMap(x => x) as FlatDistributionPair)
    const flatTarget = flatten(target);
    const withRmsd = data.map(([[s, p, decay], distributions]) => ({
        s, p, decay, distributions, error: rmsd(flatten(distributions), flatTarget)
    }));
    let {error, distributions, ...best} = min(withRmsd, ({error}) => error);
    return {
        ...best,
        target,
        distributions,
        rmsd: {
            combined: error,
            separate: [
                rmsd(distributions[0], target[0]),
                rmsd(distributions[1], target[1]),
            ],
        },
    }
}