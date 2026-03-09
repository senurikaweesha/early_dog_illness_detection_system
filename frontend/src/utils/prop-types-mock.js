const noop = () => { };
noop.isRequired = noop;

const PropTypes = {
    string: noop,
    bool: noop,
    func: noop,
    number: noop,
    object: noop,
    array: noop,
    symbol: noop,
    node: noop,
    element: noop,
    any: noop,
    arrayOf: () => noop,
    objectOf: () => noop,
    shape: () => noop,
    exact: () => noop,
    oneOf: () => noop,
    oneOfType: () => noop,
    instanceOf: () => noop,
};

export default PropTypes;
