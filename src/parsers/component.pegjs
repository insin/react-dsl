start
= component

component
= name:componentName
  props:("(" ws* props:componentProps ws* ")" { return props })?
  { return {name: name, props: props} }

componentProps "component props"
= prop:componentProp
  props:(ws* "," ws* nextProp:componentProp { return nextProp })*
  { return [prop].concat(props) }

componentProp "component prop"
= name:propName
  type:(ws* ":" ws* type:propType { return type })?
  { return {name: name, type: type} }

componentName "component name"
= first:[A-Z_$] rest:[a-z0-9_$]i* { return first + rest.join('') }

propName "prop name"
= first:[a-z_$]i rest:[a-z0-9_$]i* { return first + rest.join('') }

propType "prop type"
= first:[a-z_$]i rest:[a-z0-9_$]i* { return first + rest.join('') }

ws "whitespace"
= [ \t\r\n]
