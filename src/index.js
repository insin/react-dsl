'use strict';

var React = require('react')

var ComponentParser = require('./parsers/component')
var TagParser = require('./parsers/tag')

function getType(o) {
  return Object.prototype.toString.call(o).slice(8, -1).toLowerCase()
}

/*
Component(prop1, prop2: type)
{
   "name": "Component",
   "props": [
      {
         "name": "prop1",
         "type": null
      },
      {
         "name": "prop2",
         "type": "type"
      }
   ]
}
*/

function createComponents(spec) {
  var result = {}
  Object.keys(spec.components).forEach(componentSpec => {
    var tagSpec = spec.components[componentSpec]
    var componentDefn = ComponentParser.parse(componentSpec)
    var tagDefn = TagParser.parse(tagSpec)
    result[componentDefn.name] = createComponent(componentDefn, tagDefn, spec.functions)
  })
  return result
}

function createComponent(componentDefn, tagDefn, functions) {
  var propTypes = {}
  if (componentDefn.props) {
    componentDefn.props.forEach(prop => {
      // TODO Refine
      propTypes[prop.name] = React.PropTypes.any
    })
  }

  return React.createClass({
    displayName: componentDefn.name,
    propTypes: propTypes,
    render: function() {
      return renderTag(tagDefn, this.props, functions, true)
    }
  })
}

/*
tag.class.a{propName}b.a{functionName(propName)}b/tag
{
   "tagName": "tag",
   "classes": [
      [
         "class"
      ],
      [
         "a",
         {
            "variable": "propName"
         },
         "b"
      ],
      [
         "a",
         {
            "func": {
               "name": "functionName",
               "args": [
                  "propName"
               ]
            }
         },
         "b"
      ]
   ],
   "child": {
      "tagName": "tag",
      "classes": [],
      "child": null
   }
}
*/

function renderTag(tagDefn, props, functions, includeChildren) {
  var attrs = {}
  if (tagDefn.classes.length) {
    attrs.className = getClassName(tagDefn.classes, props, functions)
  }
  var child = null
  if (tagDefn.child) {
    child = renderTag(tagDefn.child, props, functions)
  }
  if (includeChildren) {
    return React.createElement(tagDefn.tagName, attrs, child, props.children)
  }
  return React.createElement(tagDefn.tagName, attrs, child)
}

function getClassName(classNameDefns, props, functions) {
  var classNames = []
  classNameDefns.forEach(classNameDefn => {
    var classNameParts = []
    classNameDefn.forEach(part => {
      if (getType(part) == 'string') {
        classNameParts.push(part)
      }
      else if (part.variable) {
        if (typeof props[part.variable] != 'undefined') {
          classNameParts.push(props[part.variable])
        }
      }
      else if (part.functionCall) {
        var funcResult = performFunctionCall(part.functionCall, props, functions)
        if (typeof funcResult != 'undefined') {
          classNameParts.push(funcResult)
        }
      }
    })
    if (classNameParts.length > 0) {
      classNames.push(classNameParts.join(''))
    }
  })
  return classNames.join(' ')
}

function performFunctionCall(funcCallDefn, props, functions) {
  if (typeof functions[funcCallDefn.name] != 'function') {
    throw new Error('Unknown function name: ' + funcCallDefn.name)
  }
  // Special case for single arg functon
  if (funcCallDefn.args.length == 1) {
    if (typeof props[funcCallDefn.args[0]] == 'undefined') { return }
    return functions[funcCallDefn.name](props[funcCallDefn.args[0]])
  }
  // Let multiple arg functions handle optional props themselves
  return functions[funcCallDefn.name].apply(null, funcCallDefn.args.map(function(arg) {
    return props[arg]
  }))
}

module.exports = createComponents