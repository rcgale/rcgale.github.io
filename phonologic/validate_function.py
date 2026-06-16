import json


def main(
        filename="public/map-0.20.json"
):
    with open(filename) as f:
        data = json.load(f)

    x = 0


if __name__ == '__main__':
    main()