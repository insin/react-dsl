start
= tag

tag
= name:tagName
  classes:("." className:className { return className} )*
  child:("/" child:tag { return child })?
  { return {tagName: name, classes: classes, child: child} }

className
= (name:[-a-z0-9_]i+ { return name.join('') } / variable)+

variable
= "{" variable:(f:functionCall { return {functionCall: f} } / p:propName { return {variable: p} }) "}"
  { return variable }

functionCall "function call"
= name:functionName "(" args:args ")"
  { return {name: name, args: args} }

args "arguments"
= arg:propName
  args:(" "* "," " "* arg:propName { return arg })*
  { return [arg].concat(args) }

tagName "tag name"
= name:[a-z]+ { return name.join('') }

propName "prop name"
= initial:[a-z_] rest:[a-z0-9_]i* { return initial + rest.join('') }

functionName "function name"
= name:[a-z_]i+ { return name.join('') }