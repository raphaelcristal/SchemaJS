var Schema = {};
Schema.createSchema = function (schemas) {
  "use strict";

  var SchemaError = function (message) {
    this.message = message;
    this.name = "SchemaError";
  };
  SchemaError.prototype = new Error();

  var missingKeys = function (obj1, obj2) {
    var keys = [];
    var key;
    for (key in obj1) {
      if (obj1.hasOwnProperty(key)) {
        if (!(obj2.hasOwnProperty(key))) {
          keys.push(key);
        }
      }
    }
    return keys;
  };


  var checkType = function (attr, expectedType, value) {
    var actualType = Object.prototype.toString.call(value).replace(/\[object |\]/g, '');
    if (expectedType !== actualType) {
      throw new SchemaError(
        'Expected ' + expectedType +
        ' for Attribute ' + attr +
        ', instead got ' + actualType);
    }
  };

  var checkSchema = function (schema, attrs) {
    var missingAttributes = missingKeys(schema, attrs);
    if (missingAttributes.length > 0) {
      throw new SchemaError('Model has missing Attributes: ' + missingAttributes);
    }

    var extraAttributes = missingKeys(attrs, schema);
    if (extraAttributes.length > 0) {
      throw new SchemaError('The Schema does not define the following Attributes: ' + extraAttributes);
    }
  };

  var validTypes = {
    Number: null,
    String: null,
    Array: null,
    Object: null
  };
  var checkSchemaTypes = function (schemas) {
    var schema, schemaName, property;
    //create custom schema types, e.g: Model:MyOwnModel
    Object.keys(schemas).forEach(function (schemaName) {
      validTypes["Model:" + schemaName] = null;
    });
    for (schemaName in schemas) {
      if (schemas.hasOwnProperty(schemaName)) {
        schema = schemas[schemaName];
        for (property in schema) {
          if (schema.hasOwnProperty(property)) {
            if (!validTypes.hasOwnProperty(schema[property])) {
              throw new SchemaError("Invalid type: " + schema[property]);
            }
          }
        }
      }
    }
  };

  var update = function (schema, attrs) {
    var attr;
    for (attr in attrs) {
      if (attrs.hasOwnProperty(attr)) {
        if (!schema.hasOwnProperty(attr)) {
          throw new SchemaError("The Schema does not define the following Attribute: " + attr);
        }
        checkType(attr, schema[attr], attrs[attr]);
      }
    }
  };

  //the root schema is not included by any other subschemas
  //and is therefor our starting point
  var findRootNode = function (schemas) {
    var values = function (obj) {
      var vals = [];
      var key;
      for (key in obj) {
        if (obj.hasOwnProperty(key)) {
          vals.push(obj[key]);
        }
      }
      return vals;
    };

    var rootNode = Object.keys(schemas).filter(function (schemaName) {
      var schema, otherName;
      for (otherName in schemas) {
        if (schemas.hasOwnProperty(otherName)) {
          schema = schemas[otherName];
          var index = values(schema).indexOf('Model:' + schemaName);
          if (index !== -1) {
            return false;
          }
        }
      }
      return true;
    });
    if (rootNode.length > 1) {
      throw new SchemaError("Multiple root nodes found! There can only be one!");
    }
    return rootNode.pop();
  };

  var createModel = function (schemas, attrs) {
    var rootNode = findRootNode(schemas);
    var create = function (schema, attrs) {
      checkSchema(schema, attrs);

      var model = {};
      var setValue = function () {
        throw new Error('Not writable, use update method!');
      };
      var defineProperty = function (key) {
        Object.defineProperty(model, key, {
          get: function () {
            return attrs[key];
          },
          set: setValue,
          enumerable: true,
          configurable: false
        });
      };
      var attr;
      for (attr in attrs) {
        if (attrs.hasOwnProperty(attr)) {
          //string starts with Model:
          if (schema[attr].indexOf('Model:') === 0) {
            var schemaName = schema[attr].replace('Model:', '');
            model[attr] = create(schemas[schemaName], attrs[attr]);
          } else {
            checkType(attr, schema[attr], attrs[attr]);
            defineProperty(attr);
          }
        }
      }
      model.update = function (attrs, callback) {
        update(schema, attrs, callback);
      };
      return model;
    };
    return create(schemas[rootNode], attrs);
  };

  checkSchemaTypes(schemas);
  return {
    newModel: function (attrs) {
      return createModel(schemas, attrs);
    }
  };
};