start
= component

component
= name:componentName
  props:("(" props:componentProps ")" { return props })?
  { return {name: name, props: props} }

componentProps "component props"
= prop:componentProp
  props:(" "* "," " "* prop:componentProp { return prop })*
  { return [prop].concat(props) }

componentProp "component prop"
= name:propName
  type:(" "* ":" " "* type:propType { return type })?
  { return {name: name, type: type} }

componentName "component name"
= initial:[A-Z] rest:[a-z0-9_]i* { return initial + rest.join('') }

propName "prop name"
= initial:[a-z] rest:[a-z0-9_]i* { return initial + rest.join('') }

propType "prop type"
= name:[a-z]i+ { return name.join('') }
