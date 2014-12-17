start
= tag

tag
= name:tagName
  classes:(ws* "." className:className { return className} )*
  child:(ws* "/" ws* child:tag { return child })?
  { return {tagName: name, classes: classes, child: child} }

className
= (name:[-a-z0-9_]i+ { return name.join('') } / expr)+

expr "expression"
= "{" ws*
  expr:(
    f:functionCall { return {functionCall: f} }
  / p:propName { return {variable: p} }
  )
  ws* "}"
  { return expr }

functionCall "function call"
= name:functionName "(" ws* args:args ws* ")"
  { return {name: name, args: args} }

args "arguments"
= arg:propName
  args:(ws* "," ws* arg:propName { return arg })*
  { return [arg].concat(args) }

tagName "tag name"
= name:[a-z]+ { return name.join('') }

propName "prop name"
= first:[a-z_$]i rest:[a-z0-9_$]i* { return first + rest.join('') }

functionName "function name"
= first:[a-z_$]i rest:[a-z0-9_$]i* { return first + rest.join('') }

ws "whitespace"
= [ \t\r\n]