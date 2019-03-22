export const guid = () => {
    let s4 = () => {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}


export const byString = function(o, s) {
    s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    s = s.replace(/^\./, '');           // strip a leading dot
    var a = s.split('.');
    for (var i = 0, n = a.length; i < n; ++i) {
        var k = a[i];

        if(o === null || typeof o === "undefined") { // if the object itself is null, there is no key to get
            return;
        }

        if (k in o) {
            o = o[k];
        } else {
            return;
        }
    }
    return o;
}

export const assignOnObject = (obj, prop, value) => {
    if (typeof prop === "string")
        prop = prop.split(".");

    if (prop.length > 1) {
        var e = prop.shift();
        assignOnObject(obj[e] =
                Object.prototype.toString.call(obj[e]) === "[object Object]"
                    ? obj[e]
                    : {},
            prop,
            value);
    } else
        obj[prop[0]] = value;
}

export const cloneObject = (obj) => {
    var clone = {};
    for(var i in obj) {
        if(obj[i] != null &&  typeof(obj[i])=="object")
            clone[i] = cloneObject(obj[i]);
        else
            clone[i] = obj[i];
    }
    return clone;
}
