import {readFile} from "fs";

let cache = [ '', ' ', '  ', '   ', '    ', '     ', '      ', '       ', '        ', '         ' ];

// from https://github.com/stevemao/left-pad
export function pad(str: string, len: number, ch: string = "0"): string {
    let padlen = len - str.length;
    if (padlen <= 0)
        return str;
    // cache common use cases
    if (ch == " " && padlen < 10)
        return cache[padlen] + str;
    var pad = "";
    while (true) {
        if (len & 1)
            pad += ch;
        padlen >>= 1;
        if (padlen)
            ch += ch;
        else
            break;
    }
    return pad + str;
}

export function readFileAsync(filename: string): Promise<string> {
    return new Promise(function(resolve, reject) {
        readFile(filename, function(err, data) {
            if (err)
                return reject(err);
            resolve(data.toString("utf-8"));
        });
    });
};