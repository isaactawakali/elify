# elify
> A minimal javascript library for DOM HTML Element manipulation

### Installation

[Download a minified file](https://raw.githubusercontent.com/isaactawakali/elify/main/lib/elify.min.js) to your project directories

or install with node package manager (npm)
```sh 
npm install elify
```

### How to use

Use elify in your DOM to play with and manipulate HTML elements into an object structure composed of elements defined by its selector's namespace `el()` or `elify()`. Once downloaded and installed, all you need is to initialize elify in your given environment as bellow

**In browser environment**
```
<script src = "path/to/elify.min.js" type="text/javascript">
```

**In node environment**
```
var el = require("elify")
```

**use as selector for DOM elements**
>> use `el(keyValue[String|Object], options[Object])`

*selector for elements in the DOM*
`el("div")`

*selector for creating new elements with html tags*

`el("<div>")` or `el(["div"])`

*add some more properties*
`el(["div className mydiv, id myDiv"])`

*or*
`el('<div class="mydiv" id="myDiv">')`

*also you can pass options directly in the second argument which include stylesheet properties*
```
el("#myDiv", {
   style:{background: "rgba(20, 40, 40, 1)"} , innerHTML:"hello world, this is a container"
})
```

*elifying context objects (HTMLElement, HTMLCollection and NodeList) instances directly as follows:*

`document.querySelector(".element").elify()`
`document.querySelectorAll(".element").elify()`
`document.getElementById("#element").elify()` `document.getElementsName("element").elify()` `document.getElementsByTagName('div').elify()`
`document.getElementsByClassName(".element").elify()`
`document.createElement("button").elify()`

**Create custom objects/components**

*elify as a custom object/component for new instances*
```
document.querySelector(".element").elify("MyElement")
```

*use new created instances as bellow*
```
new MyElement().appendTo("somewhere").innerHTML("my new element")

new MyElement({innerHTML:"my second new element "}).appendTo("somewhere")
```

>> or use `el.create(keyValue[String|Object], keyOptions[Object], callback[Function])`

A `keyValue` would be an html element tagName e.g `div` or any other name and also an object instance `{}` from which you can create complex objects/component

*create a simple button component with key options*
```
el.create("Button", { textContent:"this is button", color:"#cacaca"} )
```

*the above code will create and initialize a Button object in window, then use it as follows:*
```
var myButton = new Button("myButton", "white")

myButton.onclick( function(e){
    console.log(e)
})

myButton.appendTo("body")
```

*you can also apply options directry as follow*

```
new Button({
 textContent:"my button",
 style:{background:"#fafafa"} ,
 onclick: function(e){
    console.log(e)
 } 
}).appendTo(".somewhere_element")
.classList("add active")
```

*create multiple objects/components at once*
```
el.create("div, button, panel, canvas, script")
```

*create more complex and customized objects/components*
```
el.create({ Divider:'<div class="divider">'}, {width:"100%", height:"100%", innerHTML:"" })

el.create({
Container:["div"] },
{width:"", height:"", innerHTML:"" })

el.create({
TextInput:["input type text"] }, 
{placeHolder:"", width:"100%", height:"100%" })

el.create({
PillButton: el("<button>").style("background none, border none, outline none"),
{textContent:"flatButton"}] 

el.create({
    PillButton:'<button></button>'
  }, 
  {
    text:'+', color:'#bababa', size:'40px'
  }, 
  function(o){
          
     el(this, {
       //innerText: o.text,
         style:{
         color:'var(--foreground-color)',
         width: o.size,
         height: o.size,
         borderRadius:'50%',
         background:'teal',
         textAlign: 'center',
         position:'absolute',
         right:'20px',
         bottom: '15px',
         overflow: 'hidden', 
         fontSize:'13px'
        },
         on:{'click': function(argument){
              
         }} 
            
       })
       .on('touchstart, mousedown ', function(e){ 
           
          el(this, { style:{background:'red'} })
        })
       .on('touchend, mouseup ', function(e){
            
         el(this, { style:{background:'green'} })
       })
   })
```

*then use created components and pass key options as follows*
```
new Divider("20px", "", "<p> this is divider</p>").appendTo(".somewhere_element")

new Container("20px", "100px").appenTo("some_other_element")

new TextInput("type something here").appenTo("some_element")

var pillbtn = new PillButton('icon-add','blue','60px')

el("somewhere_element").append(pillbtn)

new PillButton("+").appendTo("somewhere_element")
```

**Using properties, functions or methods**

elify uses most of HTMLElement own properties and other custom defined properties which are manipurated as/into methods allowing to pass arguments to the context and chaining them as long as a chained function/method does not return a value other than elify object itself.

`style()`, `children()`, `attributes()`, `tagName()` ,`localName()`, `inneHTML()`, `outerHTML()`, `className()`, `classList()`, `align()`, `itemScope()`, `scroll()`, `scrollLeft()`, `scrollTop()`, `scrollTo()`, `scrollBy()`, `append()`, `prepend()`, `matches()`, `closest()`, `textContent()`, `disabled()`, `id()`, `isContenEditable()`, `firstChild()`, `lastChild()` ,`before()`, `after()`, `parent()`, `clone()`, `replace()`, `click()`, `focus()`, `blur()`, `select()`, `appendTo()`, `on()`, `get()`, `set()`, `trigger()`, `remove()`, `elify()`

*getter only properties*
`scrollLeft()`, `scrollWith()`, `clientLeft()`, `clientTop()`, `clienWidth()`, `clientHeight()`

and all other properties, functions and events derived from HTMLElement prototypes.

examples
*setting innerHTML and style to the context*

```
var mydiv = el(".mydiv")

mydiv.innerHTML("hello world")

mydiv.style("background red, color blue")
```

*chaining functions /methods*
```
el(".mydiv").innerHTML("hello world").style("background red, color blue")
```

**Dealing with complex properties and keys**

elify has some properties that return an object instance such as `style()` returns `CSS2Properties` or `CSSStyleDeclaration`, `attributes()` returns `namedNodeMap`, `classList()` returns `DOMTokenList` and `dataset()` returns `DOMStringMap`. So, using some of these properties would require passing a string argument as a key value.

**`style()` property and keys**

*apply style to the context*
`el("context").style("background blue, color rgba(255,255,255,1), width 50px")`

*apply as inline css*
`el("context").style("background:blue, color:rgba(255,255,255,1), width:50px")`

*or*
`el("context").style({background:"blue", color:"rgba(255,255,255,1)", width:"50px"})`

*get background of the context*
`.style("background")` *or with key* `.style("get background")`

*check the existence of background in the context with keys 'contains' or 'has'*
`.style("has background")` *or* `.style("contains background")`

**`classList()` property and keys**

*keys `add`, `remove`, `toggle`, `replace`, `has`, `forEach`*

*example add classes*
```
el("context").classList("add classA classB classC")
```

*check existence of a given class in context*
`el("context").classList("has classB")`

*use multple keys at once*
```
.classList("add classA classB, remove classE, replace classB classD")
```

*or*
```
.clasaList({add: "classA classB",remove:"classD", replace:"classE classD"})
```

*only `forEach` key will use a function in the second argument as follows:*
```
.classList("forEach", function(class, i){
   console.log(class)
})
```

**`attributes()` property and keys**

*keys `set`, `get`, `remove`, `has`*

*example setting attributes*
`el("div").attributes("set myattr attr_val")`

*get attribute value*
`.attribute("get myattr")`

*check existence of attribute*
`.attributes("has myattr")`

*multiple attributes keys*
`.attributes("set myattr attr_val, set myattr2 attr_data, remove myattr")`

*set attributes directly without keys*
`.attributes({myattr:"attr_val", myattr2:"attr_data"})`

**`dataset()` property**

`.dataset("data-key dataValue")`

*multiple data set*
`.dataset("data-key dataValue, data-key2 dataValue ")`

*or*
`dataset({'data-key':'dataValue', 'data-key2':'dataValue'})`

**Interacting with jquery functions**

if you have jquery running in the same environment, you might find it very easy to use jquery functions directly in elify and likewise in jquery.

>> use `el.$()` in your script and jquery functions will be extended with elify.

*example using jquery functions*
```
el.$()

// set html content
el("body").html("<h1>hello world<h1>")

// get css background
el("body").css("background")

// get jquery version
el("body").jquery
```

>> **Note:** Once `el.$()` is true, elify defines its properties to jquery which may override/overwrite similar jquery functions and may not work if you are using jquery's selector. So, in this case you can just avoid using jquery along with elify or just ignore this option entiely.

**Define a new property**
>> use `el.defineProperty(propName[string], callbackFn[function])`

a callback function will call the context and arguments passed to the function

*examples*
```
el.defineProperty("myProperty", function(args ,context){
    if(!args){
       return this
    }

    for(var i in this){
       // do something with args to the context 
       console.log(this[i][args])
    }
})
```

*define multiple properties*
```
el.defineProperty({
   myProperty: function(args, context){
       console.log(context[args])
       return this
   },
   myProperty2: function(args, context){
       return context[args]
   },
   myProperty3: 'hello world'
})
```

*or define to the prototype*
```
el.prototype.myProperty = function(args, opt){
   if(args){
       // so something if args are defined
   }
  // itterate context elements in this object
  for(var i in this){
       // logs context elements in this case
       console.log(this[i])
  }
 
 // returns undefined by default, you can return 'this' (elify()) object itself to allow chaining with other function
})
```

*now use your defined property as follows*
```
el('.context').myProperty("args", {})
```

**Redefine an existing property**

`el.redefineProperty("propName","newPropName")`

*redefine multiple existing properties*
```
el.redefineProperty({propName1:"newPropName1",propName2:"propName2"})
```

**Rename an existing property**

`el.renameProperty("propName","newPropName")`

*rename multiple properties*
```
el.renameProperty({propName1:"newPropName1",propName2:"newPropName2",})
```

**Remove an existing property**

`el.removeProperty("propName")`

*remove multiple properties*
```
el.removeProperty("propName1, propName2, propName3, other...")
```

### Resources and examples 

### Contribution

elify would mostly be compatible with/in modeln browsers, but still in some cases would be challenged to suite the functionality and compatibility due to progressive changes made from this library or its environment. So, in this case, you can help tracking issues related to this library. See [issues](https://github.com/isaactawakali/elify#issues), or you can make a pull request which would be reviewied in consideration of necessary fixes and changes to be merged in/with the main library.

### Licence

[MIT](./LICENSE) 2021 @[Isaac Tawakali](https://github.com/isaactawakali)