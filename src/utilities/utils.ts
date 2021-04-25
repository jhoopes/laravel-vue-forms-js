import {FormField} from "./../classes/models/formField";

export const guid = (): string => {
  let s4 = () => {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  };
  return (
    s4() +
    s4() +
    "-" +
    s4() +
    "-" +
    s4() +
    "-" +
    s4() +
    "-" +
    s4() +
    s4() +
    s4()
  );
};

export const byString = function(o: Record<string, any>, s: string): any {
  s = s.replace(/\[(\w+)\]/g, ".$1"); // convert indexes to properties
  s = s.replace(/^\./, ""); // strip a leading dot
  var a = s.split(".");
  for (var i = 0, n = a.length; i < n; ++i) {
    var k = a[i];

    if (o === null || typeof o === "undefined") {
      // if the object itself is null, there is no key to get
      return;
    }

    if (k in o) {
      o = o[k];
    } else {
      return;
    }
  }
  return o;
};

export const assignOnObject = (
  obj: Record<string, any>,
  prop: string | Array<string>,
  value: any
) => {
  if (typeof prop === "string") prop = prop.split(".");

  if (prop.length > 1) {
    let e = prop.shift();

    if (!e) {
      throw new Error("Invalid prop to assign on object");
    }

    assignOnObject(
      (obj[e] =
        Object.prototype.toString.call(obj[e]) === "[object Object]"
          ? obj[e]
          : {}),
      prop,
      value
    );
  } else obj[prop[0]] = value;
};


export const getFieldValue = (data: Record<string, any>, field: FormField) => {
  if (!field.value_field) {
    return null;
  }

  return byString(data, field.value_field);
}
