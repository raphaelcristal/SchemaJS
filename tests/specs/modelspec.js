describe("SchemaFactory", function() {
  it("should create schema if all attributes have valid types", function() {
    var goodSchema = Schema.createSchema({
      User : {
        name  : "String",
        age   : "Number",
        contacts : "Array",
        attributes : "Object"
      }
    });
  });

  it("should create a nested schema", function() {
      var goodSchema = Schema.createSchema({
          User : {
            name : "String",
            pet : "Model:Pet"
          },
          Pet : {
            age : "Number"
          }
      });
  });

  it("should throw exception when attributes have bad types", function() {
    expect(function() {
      var badSchema = Schema.createSchema({
        User : {
          foo  : "BadType"
        }
      });
    }).toThrow("Invalid type: BadType");
  });

  it("should throw an exception for invalid non-exsistend custom types", function() {
    expect(function() {
      var badSchema = Schema.createSchema({
        User : {
          foo : "Model:Bad"
        }
      });
    }).toThrow("Invalid type: Model:Bad");
  });


});

describe("ModelFactory", function() {

  var testSchema = Schema.createSchema({
    User : {
      name  : "String",
      age   : "Number",
      contacts : "Array",
      attributes : "Object"
   }
  });

  var testSchemaNested = Schema.createSchema({
    User : {
      name : "String",
      pet : "Model:Pet"
    },
    Pet : {
      age : "Number"
    }
  });

  it("should create model successfully if attribute types are correct", function() {
    var myModel = testSchema.newModel({
      name : "Jon Doe",
      age  : 83,
      contacts : [],
      attributes : {}
    });
  });

  it("should create a nested model", function() {
    var myModel = testSchemaNested.newModel({
      name : "Hans",
      pet : {
        age : 15
      }
    });
    expect(myModel.name).toEqual("Hans");
    expect(myModel.pet.age).toEqual(15);
  });

  it("should throw an error for a wrong nested data type", function() {
    expect(function() {
      testSchemaNested.newModel({
        name : "Hans",
        pet : {
          age : []
        }
      });
    }).toThrow(new Error("Expected Number for Attribute age, instead got Array"));
  });

  it("should throw an error if a wrong data type is assigned", function() {
    expect(function() {
      testSchema.newModel({
        name : 666,
        age  : 83,
        contacts : [],
        attributes : {}
      });
    }).toThrow(new Error("Expected String for Attribute name, instead got Number"));

    expect(function() {
      testSchema.newModel({
        name : "Jon Doe",
        age  : "WRONG",
        contacts : [],
        attributes : {}
      });
    }).toThrow(new Error("Expected Number for Attribute age, instead got String"));

    expect(function() {
      testSchema.newModel({
        name : "Jon Doe",
        age  : 83,
        contacts : "WRONG",
        attributes : {}
      });
    }).toThrow(new Error("Expected Array for Attribute contacts, instead got String"));

    expect(function() {
      testSchema.newModel({
        name : "Jon Doe",
        age  : 83,
        contacts : [],
        attributes : "WRONG"
      });
    }).toThrow(new Error("Expected Object for Attribute attributes, instead got String"));
  });

  it("should detect missing attributes", function() {
    expect(function() {
      testSchema.newModel({
        name : "Jon Doe"
        //,age  : 83
        ,contacts : []
        ,attributes : {}
      });
    }).toThrow(new Error("Model has missing Attributes: age"));
  });

  it("should detect extra attributes", function() {
    expect(function() {
      testSchema.newModel({
        name : "Jon Doe"
        ,age  : 83
        ,contacts : []
        ,attributes : {}
        ,nonsense : "foobar"
      });
    }).toThrow(new Error("The Schema does not define the following Attributes: nonsense"));
  });
});
describe("Model Update", function() {
    var testSchema = Schema.createSchema({
        User : {
          name : "String"
        }
    });
    var testModel = testSchema.newModel({
        name : "Jon Doe"
    });
    var testSchemaNested = Schema.createSchema({
        User : {
          name : "String",
          pet : "Model:Pet"
        },
        Pet : {
          age : "Number"
        }
    });
    var testModelNested = testSchemaNested.newModel({
      name : "Peter",
      pet : {
        age : 15
      }
    });

    it("should throw an error if the attribute does not exist", function() {
        expect(function() {
            testModel.update({ age: 15 }, function() {
            });
        }).toThrow(new Error("The Schema does not define the following Attribute: age"));
    });

    it("should throw an error if the attributes has the wrong type", function() {
        expect(function() {
            testModel.update({ name: 10 }, function() {
            });
        }).toThrow(new Error("Expected String for Attribute name, instead got Number"));
    });

    it("should update a nested attribute", function() {
      console.log(testModelNested.pet);
      testModelNested.pet.update({ age : 25 });
    });
});
