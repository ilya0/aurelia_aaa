const REMATCH = /\/(.*)\/(\w*)/;

export class FilterValueConverter {
    toView(array, config) {
        var result: Object[] = array.slice(0);
        // console.log(array, config);
        var boolStrings: string[] = (!config.boolean || !Array.isArray(config.boolean)) ? [config.boolean] : config.boolean;
        var regex: string = config.regex;

        if (boolStrings) {
            result = result.filter((o) => {
                // console.log('Object', o);
                return boolStrings.every((p) => {
                    // console.log('Property', p, o[p.substr(1)]);
                    return (p.substr(0, 1) === '!') ? !o[p.substr(1)] : o[p];
                })
            });
        }

        if (regex) {
            let keys = Object.keys(regex).filter((key) => regex[key]);
            if (keys.length && !keys.every((key) => regex[key] == null)) {
                result = result.filter((item) => {
                    return keys.some((key) => {
                        let re = regex[key] || '';
                        let match = REMATCH.exec(re);
                        if (match) {
                            re = new RegExp(match[1], match[2]);
                        } else {
                            re = new RegExp(re, 'i');
                        }
                        let value = item[key] || '';
                        return re.test(value);
                    });
                });
            }
        }

        //console.log(result);
        return result;
    }
}