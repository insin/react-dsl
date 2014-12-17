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

/**
 * Builds a classname from a list of definitions.
 * If a variable is undefined or a function call returns undefined, the entire
 * class name definition containing it will be skipped.
 * @param {Array.<Array.<Object|string>>} classNameDefns a list of class name
 *   definitions - each definition is a list of literal string parts, variable
 *   definitions or function call definitions.
 */
function getClassName(classNameDefns, props, functions) {
  var classNames = []
  classNameDefns.forEach(classNameDefn => {
    var classNameParts = []
    for (var i = 0, l = classNameDefn.length; i < l ; i++) {
      var part = classNameDefn[i]
      if (getType(part) == 'string') {
        classNameParts.push(part)
      }
      else if (part.variable) {
        // Bail out if the variable was not provided
        if (typeof props[part.variable] == 'undefined') {
          return
        }
        classNameParts.push(props[part.variable])
      }
      else if (part.functionCall) {
        var funcResult = performFunctionCall(part.functionCall, props, functions)
        // Bail out if the function call didn't return anything
        if (typeof funcResult == 'undefined') {
          return
        }
        classNameParts.push(funcResult)
      }
    }
    classNames.push(classNameParts.join(''))
  })
  return classNames.join(' ')
}

function performFunctionCall(funcCallDefn, props, functions) {
  if (typeof functions[funcCallDefn.name] != 'function') {
    throw new Error('Unknown function name: ' + funcCallDefn.name)
  }
  // Let functions handle optional props themselves
  return functions[funcCallDefn.name].apply(null, funcCallDefn.args.map(function(arg) {
    return props[arg]
  }))
}

module.exports = createComponents