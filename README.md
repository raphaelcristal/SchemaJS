SchemaJS
========
### Browser Support
This library will only work in newer browser, because methods like Object.defineProperty are used. If you want to find out if your browser is supported, just run the tests  and check if they pass!

### Basic Usage

SchemaJS allows you to define your schemas in json, which will then be generated for you.
A simple example:

```javascript
var personSchema = Schema.createSchema({
  Person : {
    name : "String",
    age : "Number",
    friends : "Array"
  }
}};
var peter = personSchema.newModel({
  name : "Peter",
  age : 25,
  friends: ['Jon', 'Frank']
});
peter.name //"Peter"
peter.age //25
peter.update({ name : 50 }); //error, wrong type
peter.update({ name : "Peter Senior" });
peter.name //"Peter Senior"

var jon = personSchema.newModem({
  name : 'John'
}); //error, missing properties

var jon = personSchema.newModel({
  name : 'John'
  age : 50,
  friends : ['Peter']
  foo: 'bar'
}); //error, extra properties
```

SchemaJS will check for three crucial things, so that your models stay consistent:

- all properties which were defined in the schema need to be present
- no extra properties are allowed
- types will be checked

Valid types are:

- String
- Number
- Boolean
- Array
- custom Objects (need to start with Model:, eg Model:MyOwnModel)

### Nested Models

It is also possible to nest your Models like this:

```javascript
var personSchema = Schema.createSchema({
  Person : {
    name : "String",
    age : "Number",
    pet : "Model:Pet"
  },
  Pet : {
    male : "Boolean",
    type : "String"
  }
}};
var peter = personSchema.newModel({
  name : "Peter",
  age : 25
  pet : {
    male : true,
    type : "Cat"
  }
});
peter.name //"Peter"
peter.pet.male //True
peter.update({ age: 26 });
peter.age //26
peter.pet.update({ type : "Dog" });
peter.pet.type // "Dog"
```

