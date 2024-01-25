import { Transform } from "stream";

const { Transform, pipeline } = require('stream');

const transformData = (): Transform => {
    return new Transform({
        objectMode: true,
        transform:() => {
            //mapping
        }
    });
}

