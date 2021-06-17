( function(global, factory){
	
	if(typeof exports === 'object' && typeof module !== 'undefined') {
		
		module.exports = factory()
	}
	
	else if(typeof define === 'function' && define.amd ){
		
		define(factory) 
	} 
	
	else {
		
		global = global || self
		
		global.el = global.elify = factory() 
	}

}(this, ( function(){
  'use strict'

	var properties = {},
	  externalProps = {},
	  redefinedProps = {}, 
	  removedProps = {}, 
	  renamedProps = {},
	  collectedEvent = {}
 
  // custom string properties intended for internal use only
	Object.defineProperties(String.prototype, {
		/*'trim': {
			value: function(){ return this.replace(/\s+/g,'') },
		},*/
		'trimLeft': {
			value: function(){ return this.replace(/^\s+/g,'') }
		},
		/*'trimRight': {
			value: function(){ return this.replace(/^\s+$/g,'') }
		},*/
		'trimLR': {
			configurable:false,
			value: function(){ return this.replace(/^\s+|\s+$/g,'') }
		},
		'trimWith': {
			configurable:false,
			value: function(val){
				
				if(typeof val !== 'string'){
					
					throw new TypeError("invalid value!, can't trimWith " + val )
				}
				
				return this.replace(/\s+/g, val) 
			}
		}
	})
	
	/**
	 * @param {key} key to determine key elements for the selector
	 * @param {options} directly passing options to context
	 * @return returns a new Elify_ object instance
	 */
	function Elify(key, options, callback){
		
		var 
			// context decrared at once by the selector in the first argument
			context = Elify.selector(arguments[0]),
			
			// passing the second argument as optional arguments
			options = arguments[1] || {}
			
		// the object constructor's
		function Elify_(){
			
			//context elements length in this constructor
			this.length = context.length
			
			for(var i in context){
				
				// context elements in this constructor
				this[i] = context[i]
			} 
			
      for(var key in options){
        
				try{
				  
					// applying aptional arguments directly to context
					el(context)[key](options[key])
				}
				
				// ignoring invalid values to the context
				catch(ex){} 
			}
		}
	
		// passing an object type/instance of key '{}' and making a shortcut 
		// way of creating custom Elify objects/components
		if(typeof arguments[0] === 'object' && arguments[0].constructor.name === 'Object' ){
		
			Elify.create(arguments[0], options)
			
			// inheriting Elify prototype to the object arguments
			arguments[0].__proto__ = Elify.prototype
			
			return arguments[0]
		}

		// binding properties and context in Elify
		Elify.bindProperties(Elify.prototype, context)
	
		// inheriting constructor's proto (Elify_) as Elify own prototype
		Elify_.prototype = Elify.prototype
		
		return new Elify_
	}
  
	/** determining context key elements from the given key value
	 * @param {key} a key to determine key elements
	 * @return {Array} returns a collection of key elements
	 */
	Elify.selector = function(key){
		
		var matchesHTMLTag = /^(\<(.*?)>(.*?)\<\/(.*?)>|\<(.*?)\>)/.test( key ),
			
			matchCommas = function(val){
			
				// passing a clean single white-Spaced value
				val = val.trimLR().trimWith(' ')

				var parMatch = val.match(/[^,]+\((.*?)\)/g),
		
					// first text segment is the tag name
					tag = val.split(' ')[0],

					// joining a mached value along with the lest of args splited by ','
					// as/into element attributes or css property segment collection
					attris = parMatch ? parMatch.concat(val.replace(tag,'').split(',')) : 
						val.replace(tag,'').split(','),
							
					element = document.createElement(tag),
			
					type = typeof element.type !== 'undefined' ? element.type : '',
					
					classname = type ? tag.toLowerCase() + '-' + type : tag.toLowerCase()
					
				element.classList.add(classname)
					
				attris.forEach( function(val){
	
					var splitedVal = val.trimLR().trimWith(' ').split(' '),
						
						attr = splitedVal[0].trimLR(),
					
						attrVal = val.replace(splitedVal[0],'').trimLR()
				
					try{
	
						element[attr] = attrVal
			
						element.style[attr] = attrVal
			
					} 
					catch(err){}
				})
				
				return element
			
			},
			pushMatched = function(keyVal, stack){
				
				if(keyVal instanceof Object){
			
					Object.values(keyVal).forEach( function(element){
						
						if(element instanceof HTMLElement){
							
							stack.push(element)
						}
					})
					
					return 
				}
	
				// split the key value by ',' into a collection of tagged element values
				keyVal.split(',').forEach( function(keyEl){
			
					// storing key elements in the temporally element's innerHTML
					var temp = document.createElement('temp')
					temp.innerHTML = keyEl

					// then element is the last child elements from temporally element
					var element = temp.lastChild || temp.lastElementChild

					stack.push(element)
				})
			},
			isJqueryObj = function(key){
				
				return key.constructor.name === 'n' ? true : false
			},
			isElifyObj = function(key){
				
				return key.constructor.name === 'Elify' ? true : false
			}

		// returning an empty collection if key is not defined
		if( !key ){ return [] }
		
		// determine keys from a string type
		if( typeof key === 'string' ){
			
			var collection = []
			
			//push matched html tagged element key into collection 
			if(matchesHTMLTag) {
		
				pushMatched(key, collection)
		
				return collection
			}
			
			if( /[^,]+\((.*?)\)|\,$/.test(key) ){
				
				var element = matchCommas(key)
			
				collection.push(element)
				
				return collection
			}
			
			// otherwise selecting elements using nodeList selector method
			try{
			
				var context = document.querySelectorAll(key)
				
				return Array.prototype.slice.call(context)
				
			} catch(err){ 
		
				// ignoring invalid selector error
				return []
			}
			
		}
		
		// determine keys from an array objext type
		if( typeof key === 'object' && Array.isArray(key) ){
				
			var collection = []
		
			Array.prototype.forEach.call(key, function(val){
				
				//ingoring undefined args and returning an empty collection
				if(!val){ return [] } 
				
				// select from a match of html tag elements
				if(matchesHTMLTag){
			    
					pushMatched(val, collection)
					
					return collection
				}
				
				if(val instanceof HTMLElement){
			
					collection.push(val)
					
					return collection
				}
				
				if( /[^,]+\((.*?)\)|\,.*?|\.*?/.test(val) ){
					
					var element = matchCommas(val)
					
					collection.push(element)
					
					return collection
				}
			})
		
			return collection
		}
        
		if( typeof key === 'object' && key instanceof NodeList){
			
			return Array.prototype.slice.call(key)
		}
		
		if( typeof key === 'object' && key instanceof HTMLCollection){
			
			return Object.values(key)
		}
		
		if( typeof key === 'object' && (isJqueryObj(key) || isElifyObj(key)) ){
			
			var collection = []
			
			// collecting html element instance values only 
			Object.values(key).forEach( function(element){
				
				if(element instanceof HTMLElement){
					
					collection.push(element)
				}
				
			})
			
			return collection
		}
		
		// if( typeof key === 'object' && key instanceof HTMLElement ){ return [key] }
		
		return [key]
	}
	
	/** for collecting properties all together and binding to given object and context
	 * @param {obj_} the object to which properties will be binded
	 * @param {context} the context elements to which properties will be binded
	 */
	Elify.bindProperties = function(obj_, context_){

		// collecting properties all together and
		// manipulating each property key into methods
		
		// collecting all property keys from HTMLElement prototype
		Object.keys(HTMLElement.prototype).forEach( function(key){
		
			properties[key] = key
		})
		
		// a collection of selective properties from HTMLElement.prototype.__proto__
		Array('children', 'attributes', 'tagName', 'localName', 'innerHTML', 'outerHTML',
		 'className','classList', 'align', 'itemScope', 'before', 'after', 'remove', 'scroll',
		 'scrollLeft', 'scrollTop', 'scrollTo', 'scrollBy', 'append', 'prepend', 'matches', 'closest', 
		 'textContent', 'disabled','id', 'isContentEditable',
		 /*'firstElementChild', 'lastElementChild', 'insertBefore', 'insertAfter',*/
		   
		 // getter only properties
		 'scrollHeight', 'scrollWidth', 'clientLeft', 'clientTop', 'clientWidth', 'clientHeight'
		).forEach( function(key){ properties[key] = key })

		// modified properties to shorten or give a better naming and functionality in this case
		var modified = {
			firstChild:'firstElementChild', lastChild:'lastElementChild', before:'insertBefore',
			after:'insertAfter', replace:'replaceWith', parent:'parentNode', clone:'cloneNode'
		}
		
		Object.keys(modified).forEach( function(key){ properties[key] = modified[key] })
		
		// Object.keys(redefinedProps).forEach( function(key){ properties[key] = key })
	
		// manipulating all collected properties into functions/methods
		Object.keys(properties).forEach( function(propKey){
			Object.defineProperty(obj_, propKey ,{
				
				// non-configurable properties to be redefined in the given obj_
				configurable: true,
				writable: true,
				
				/** considering properties which returns an object instance such as
				* {style: CSS2Properties, children: HTMLCollection, childNodes: nodeList, classList: DOMTokenList
				* dataSet: DOMStringMap, attributes: NamedNodeMap }
				*
				* functions
				* { click, focus, blur, append, prepend, replaceWith, remove, after, before, closest, matches}
				*
				* other modified properties
				* { firstChild: firstElementChild, lastChild: lastElementChild, before, after }
				*
				* and all other properties
				*
				* (arguments_) as possible arguments parameters or returner values
				*
				* @param {args[String|Object|Function|Number|boolean]} possible argument values
				* @param {opt[Object]} optional arguments which would also include styleSheet properties
				* @param {cb[Function]} optional callback function
				* @return {[String|Object|Number|Boolean]} possible returning values
				*/
				value: function fn(arguments_){
					
					var context = context_ || this,
						args = arguments[0],
						opt = arguments[1],
						cb = arguments[2]

					// Keys get, has
					if(propKey === 'style'){
						
						var computedStyle = getComputedStyle(context[0])
						
						if(!args){
	
							// returning the context styleSheet object/ CSSProperties
							return computedStyle
						}
						
						// applying styleSheet property values to context
						for(var i in context){

							// manipulating css property values from an object into context
							if(typeof args === 'object' && !Array.isArray(args)){
								
								Object.keys(args).forEach( function(val){
								
									// applying css values to the context
									context[i][properties[propKey]][val] = args[val] // context.style[val] = args[val]
								})
							}

							// manipulating css property values from a string args into context
							if(typeof args === 'string'){ 
							 
							  args = args.trimLR()
							  
    						var vals = args.trimWith(' ').split(' '),
    					  
    							argsVal = args.replace(vals[1] ? vals[0] : '', '').trim(),
    							
    						  getVal = getComputedStyle(context[0])[argsVal]
    						  
    						if(/^(get)/.test(args) || !/\s+/.test(args)){
    								
    							// return the computed css property value by matching the fireargument with/without key 'get'
    							return getVal 
    	
    						}
    	
    						if(/^(contains|has)\:?\s+(.*?)/.test(args)){
    								
    							// return the existence of css property value by matching the argument with  key 'has'
    							return getVal ? true : false
    						}
    						
								// passing the matching text argument as inline css text
								if( args.match(/(.*?)\:(.*?)\;/) ){

									// applying inline css text into context style
									context[i][properties[propKey]]['cssText'] = args
								}

								// matching a text argument along with parathesis
								var parMatch = args.match(/[^,]+\((.*?)\)/g),

									// joining a mached value along with the lest of args splited by ','
									// as/into css text segment collection
									cssSegments = parMatch ? parMatch.concat(args.split(',')) : args.split(',')
	
								// applying css to the context
								cssSegments.forEach( function(segmentVal){

									// triming extra white-Space then spliting the segment value by a single white-Space 
									var splitedVal = segmentVal.trimLR().trimWith(' ').split(' '),
										
										// first splited value is property key/id
										prop = splitedVal[0],
										
										// the lest value is property value excluding the first splited value /prop
										propVal = segmentVal.replace(splitedVal[0],'').trimLeft()

									if(propVal){

										try{
											// applying css values to the context
											context[i][properties[propKey]][prop] = propVal
										}
										catch(ex){}
									}
								})

							}
							
						}

						return this
					}
	
					// Keys: add, remove, toggle, replace, has, forEach
					if(propKey === 'classList'){
		
						if(!args){
							
							// returning the context classList object/ DOMTokenList if args not defined
							return context[0][properties[propKey]]
						}

						// returning the existence of classList value in class collection matched with/without keys 'contains' or 'has'
						if(/^(contains|has)\:?\s+(.*?)/.test(args) || !/\s+/.test(args) ){
			
							var classCollection = []

							for(var i in context){
			
								// the classList Object (DOMTokenList)
								var classListObj = context[i][properties[propKey]]

								// can't directly return classList values of each object inside this loop here, so
								// iterating classList values of each classList object (DOMTokenList )
								// into a class collection
								Array.prototype.forEach.call(classListObj, function(arg){
									
									classCollection.push(arg)
								})
							}
	
							var vals = args.trimLR().trimWith(' ').split(' '),
								argsVal = args.replace(vals[1] ? vals[0] : '', '').trim()
								
							// returning the existence of classList value in class collection by its value
							return classCollection.includes(argsVal)
						}

						for(var i in context){
			
							// manipulating classList property keys and binding arguments 
							// of each key value to the context
							var classListObj = context[i][properties[propKey]], // context[i].classList
								bindKeys = function(keyVal, argsVal){
						
									//remove extra white-spaces and then split the args value by single white-space
									argsVal = argsVal.trimLR().trimWith(' ').split(' ')

									if(keyVal === 'add'){
										argsVal.forEach( function(classes){
											classes = classes.trim()
											classListObj.add(classes)
										})
									}
										
									if(keyVal === 'remove'){
										argsVal.forEach( function(classes){
											classes = classes.trim()
											classListObj.remove(classes)
										})
									}
										
									if(keyVal === 'toggle'){
										argsVal.forEach( function(classes){
											classes = classes.trim()
											classListObj.toggle(classes)
										})
									}
					
									if(keyVal === 'replace'){
										var replacer = argsVal[argsVal.length -1].trim()
							
										argsVal.forEach( function(classes){
											classes = classes.trim()
											classListObj.replace(classes, replacer)
										})
									}
									
									if(keyVal === 'forEach'){
										cbEvent = function(){}
										classListObj.forEach( cbEvent )
									}
								}
		
							// manipulating classList property values from an object argument
							if(typeof args === 'object' && !Array.isArray(args)){

								Object.keys(args).forEach( function(val){
						
									// applying classList values to the context
									bindKeys(val, args[val])
								})
							}
							
							// manipulating classList property keys and values from string argument
							if(typeof args === 'string'){
								
								args.split(',').forEach( function(val){
								
									val = val.trimLR() 
						
									//matching a classList (DOMTokenList) property Key at the beggining of the argument value
									if( /^(add|remove|toggle|replace)\:?\s+/.test(val)){
				
										var vals = val.trimLR().trimWith(' ').split(' '),

											//the first splited value is propKey value
											keyVal = vals[0].replace(/\s+|\:?/g,''),
									
											//the lest  value is argument value excluding classList (DOMTokenList) property keys 
											//matched at the beggining of the argument value
											argsVal = val.replace(/^(add|remove|toggle|replace)\:?/g,'')
						
										bindKeys(keyVal, argsVal)
									}
								})
							}
						}
						
						return this
					}

					// Keys: get, set, remove, has
					if(propKey === 'attributes'){

						if(!args){
							
							// returning the context attributes object/ namedNodeMap if args not defined
							return context[0][properties[propKey]]
						}
				
						//return attributes property value by matching its property id with or without key 'get'
						if(/^get/.test(args) || !/\s+/.test(args)){
									
							var vals = args.trimLR().trimWith(' ').split(' '),
						
								//the first splited value is propKey value
								keyVal = vals[0].replace(/\s+|\:?/g,''),
								
								// the lest  value is argument value excluding classList (DOMTokenList) property keys 
								// matched at the beggining of the argument value
								argsVal = args.replace(/^get\:?/g,'').trim()
							
							return context[0].getAttribute(argsVal)
						}

						// returning the existence of attributes value in class collection matched with keys 'contains' or 'has'
						if(/^(contains|has)\:?\s+(.*?)/.test(args) ){
			
							var vals = args.trimLR().trimWith(' ').split(' '),
								argsVal = vals[1].trim()
			
							return context[0].hasAttribute(argsVal)
						}

						for(var i in context){

							var namedNodeMapObj = context[i][properties[propKey]], // context[i].attributes
								bindKeys = function(keyVal, argsVal){
									//remove extra white-spaces and then split the args value by single white-space
									argsVal = argsVal.trimLR().trimWith(' ').split(' ')
									
									if(keyVal === 'set'){
										argsVal.forEach( function(classes){
											classes = classes.trim()
											namedNodeMapObj.item(classes)
										})
									}
									
									if(keyVal === 'get'){
										argsVal.forEach( function(classes){
											classes = classes.trim()
											namedNodeMapObj.get(classes)
										})
									}
									
									if(keyVal === 'remove'){
										argsVal.forEach( function(classes){
											classes = classes.trim()
											namedNodeMapObj.remove(classes)
										})
									}
										
									if(keyVal === 'has'){
										argsVal.forEach( function(attr){
											attr = attr.trim()
											namedNodeMapObj.has(classes)
										})
									}
								}
			
							// manipulating set attributes property and applying values into context
							if(typeof args === 'object' && !Array.isArray(args)){
								
								Object.keys(args).forEach( function(val){
									
									//applying attributes values to the context
									//for example: context.setAttributes({val: args[val]},etc...)
									context[i].setAttribute(val, args[val])
								})
							}
							
							if(typeof args === 'string' ){
								
								var thisObj = this
								
								args.split(',').forEach( function(val){
								
									val = val.trimLR()
									
									var keyItem = val.trimLR().trimWith(' ').split(' ')[0],
										argsVal = val.replace(keyItem,'').trimLR().trimWith(' ')
									
									if(/^(set)/.test(val)){
										
										var keyVal = val.trimWith(' ').split(' ')[0],
											keyItem = val.trimWith(' ').split(' ')[1],
											argsVal = val.replace(keyVal,'').replace(keyItem,'').trimLR().trimWith(' ')
						
										//applying attributes values to the context
										context[i].setAttribute(keyItem, argsVal)
										
										return thisObj
									}
									
									if(/^(remove)/.test(val)){
										
										//remove attributes values to the context
										context[i].removeAttribute(splitedVal[1])
										
										return thisObj
									}
									
									//applying attributes values to the context generally
									context[i].setAttribute(keyItem, argsVal)
								})
								
							}
						}
				
						return this
					}

					if(propKey === 'children'){
				
						var childElements = []
				
						for(var i in context){
							
							// the children object (HTMLCollection) to iteratable collection
							childElements = Array.prototype.slice.call(context[i].children) 
						}
				
						if(!args && isNaN(args)){
			
							return Elify(childElements)
						}
			
						if(typeof args === 'number' || !isNaN(args) ){
					
							if(opt){
								
								Elify(childElements[args], opt)
	
								return this
							}
				
							return Elify(childElements[args])
						}
				
						Elify(childElements, args)

						return this
					}

					if(propKey === 'dataset'){
						
						if(!args){
							
						}
						else{
							
							var splitedArgs = args.trimLR().trimWith(' ').split(' ')
							
							for(var i in context){
								
								// check for a second splited args to set
								if(splitedArgs[1]){
									
									context[i][propKey][splitedArgs[0]] = splitedArgs[1]
									
									return this
								}
								
								return context[i][propKey][splitedArgs[0]] 
							}
						}
		
					}
					
					if(propKey === 'firstChild'){

						var firstChildCol = []

						for(var i in context){
			
							firstChildCol.push(context[i][properties[propKey]])
						}

						if(!args){
						
							return Elify(firstChildCol)
						}

						//applying arguments to context's firstChild elements
						Elify(firstChildCol , args)

						return this
					}
		
					if(propKey === 'lastChild'){
			
						var lastChildCol = []

						for(var i in context){
							
							lastChildCol.push(context[i][properties[propKey]])
						}
	
						if(!args){
							
							return Elify(lastChildCol) 
						}
					
						//applying arguments to context's lastChild elements
						Elify(lastChildCol , args)

						return this
					}
					
					if(propKey === 'matches'){
						
						if(!args){
							
							throw new TypeError('arguments required to determine matched context elements')
						}
						
						for(var i in context){
							
							if(context[i][propKey]){
							
								return context[i][propKey](args)
							}
							
							// support for internet explorer 'msMatchesSelector'
							if(context[i].msMatchesSelector){
								
								return context[i].msMatchesSelector(args)
							}
							
							// support for webkitMatchesSelector
							if(context[i].webkitMatchesSelector){
								
								return context[i].webkitMatchesSelector(args)
							}
						
							var matches = document.querySelectorAll(args),
								
								ai = matches.length
								
							while(--ai >= 0 && matches[ai] !== context[i]){}
							
							return ai > -1
								
						}
						
					}
					
					if(propKey === 'closest'){
						
						if(!args){
							
							throw new TypeError('requires args to determine a closest context elements')
						}
						
						for(var i in context){
							
							if(context[i][propKey]){
								
								var closest = context[i][propKey](args)
								
								return Elify(closest ? closest : undefined)
							}
							
							var matches = document.querySelectorAll(args),
								
								ai = matches.length
							
							do {
								
								while(--ai >= 0 && matches[ai] !== context[i]){}
							}
							
							while((ai < 0) && (context[i] = context[i].parentNode)){
							
								return Elify(context[i] ? context[i] : undefined)
							}
						}
					}
					
					if(propKey === 'remove' || propKey === 'removeNode'){

						if(!args){

							for(var i in context){
								
								// support for 'remove' method
								if(context[i][propKey]){
								
									context[i][propKey]()
								}
								
								// support for internet explorer 'removeNode'
								if(context[i].removeNode){
									
									context[i].removeNode()
								}
							}

							return this
						}
							
						Elify(args).remove()

						return this
					}

					if(propKey === 'before' || propKey === 'insertBefore'){
						
						var prevElementsCol = []
						
						for(var i in context){
							
							prevElementsCol.push(context[i].previousElementSibling)
						}
						
						if(!args){
							
							return Elify(prevElementsCol)
						}
						
						if(typeof args === 'object' && args.constructor.name === 'Object'){
						
							Elify(prevElementsCol, args)
			
							return this
						}
					
						var newContext = Elify.selector(args)
							
						for(var i in context){
						    
							if(typeof args === 'string'){
								
								// inserting for adjacent html matched tags
								if(/^(\<(.*?)>(.*?)\<\/(.*?)>|\<(.*?)\>)/.test( args )){
									
									context[i].insertAdjacentHTML('beforebegin', args)
								}
								// otherwise insering for adjacent text
								else{
									
									context[i].insertAdjacentText('beforebegin', args)
								}
								
								return this
							}
							
							for(var ai in newContext){
									
								// context[i].before(newContext[ai])
								 context[i].insertAdjacentElement('beforebegin', newContext[ai])
								//context[i].parentNode.insertBefore(newContext[ai], context[i])
							}
						}
				
						return this
					}
					
					if(propKey === 'after' || propKey === 'insertAfter'){
						
						var nextElementCol = []

						for(var i in context){
							
							nextElementCol.push(context[i].nextElementSibling)
						}
			
						if(!args){
					
							return Elify(nextElementCol)
						}

						if(typeof args === 'object' && args.constructor.name === 'Object'){

							Elify(nextElementCol, args)

							return this
						}
		
						var newContext = Elify.selector(args)
							
						for(var i in context){
							
							if(typeof args === 'string'){
								
								// inserting for adjacent html matched tags
								if(/^(\<(.*?)>(.*?)\<\/(.*?)>|\<(.*?)\>)/.test( args )){
								
									context[i].insertAdjacentHTML('afterend', args)
								}
								// otherwise inserting for adjacent text
								else{
									
									context[i].insertAdjacentText('afterend', args)
								}

								return this
							}
							
							// insering for 
							for(var ai in newContext){
									
								//context[i].after(newContext[ai])
								context[i].insertAdjacentElement('afterend', newContext[ai])
								//context[i].parentNode.insertBefore(newContext[ai], context[i].nextElementSibling)
							}
						}

						return this
					}
				
					if(propKey === 'clone' || propKey === 'cloneNode'){
						
						var clonedColl = [],
						
							isBool = opt && typeof opt === 'boolean' ? opt : true
					
						for(var i in context){
							
							if(args && !isNaN(args)){
								
								//parsing a numeric type of argument to determine number of clones

								for(var a = 0; a < args; a++){
								  
								  if(context[i] instanceof HTMLElement){
								    
									  clonedColl.push(context[i].cloneNode(isBool))
								  }
								}
							}
							else{
								if(context[i] instanceof HTMLElement){
								  
								  clonedColl.push(context[i].cloneNode(isBool))
								}
							}
						}

						return Elify(clonedColl)
					}

					if(propKey === 'parent' || propKey === 'parentNode' || propKey ==='parentElement'){

						var parentCol = []

						for(var i in context){
							
							parentCol.push(context[i][properties[propKey]])
						}
					
						if(!args){
							
							return Elify(parentCol)
						}
			
						Elify(parentCol , args)
			
						return this
					}
					
					if(propKey === 'replace' || propKey === 'replaceNode' || propKey === 'replaceChild'){
						
						var newContext = typeof args === 'string' && !/<(.*?)>/.test(args) ? args : Elify.selector(args)
						
						for(var i in context){
					   
					    if(newContext instanceof Object || /<(.*?)>/.test(newContext ) ){
							
  							for(var ai in newContext){
  								
  								// to use replaceChild with second arguments as a child element to replace
  								if(arguments[1]){
  							
  									context[i].replaceChild(arguments[0], arguments[1])
  									
  									return this
  								}
  								
  								// support for 'replaceWith' method
  								if(context[i][properties[propKey]]){
  									
  									context[i][properties[propKey]](newContext[ai])
  								}
  								
  								// support for internet explorer 'replaceNode' method
  								if(context[i].replaceNode){
  									
  									context[i].replaceNode(newContext[ai])
  								}
  						}
  						  
					    }
					    else {
					      console.log(args)
					      context[i].replaceWith(newContext)
					    }
						  
						}

						return Elify(newContext)
					}
					
					if(propKey === 'append' || propKey === 'prepend'){

						var newContext = Elify.selector(args)
						
						var thisContext = this
						
						for(var i in thisContext){
		
							for(var ai in newContext){
							  
								if(thisContext[i] instanceof HTMLElement){
								// support for append and prepend methods
								if(thisContext[i][properties[propKey]]){
									
						     thisContext[i][properties[propKey]](newContext[ai])
								}
								else {

									propKey === 'append' ?
								   thisContext[0].insertAdjacentElement('beforeend', newContext[ai]) :
									thisContext[0].insertAdjacentElement('afterbegin', newContext[ai])
								}
								}
							}
						}
					
						return Elify(thisContext, opt)
					}
	
					if(propKey === 'click' || propKey === 'focus' || propKey === 'blur'){
						
						if(args && typeof args === 'function'){
							
							args.call(this)
						}
						
						for(var i in context){
							
							context[i][properties[propKey]]()
						}
						
						return Elify(context)
					}
					
					if(propKey === 'el' || propKey === 'elify'){
						
						var obj = {}
						
						obj[args] = this
						
						return this[0] && args ? Elify(obj, opt) : ( function(){
							
							throw new TypeError('Could not initialize custom object "'+ args + '" with undefined context')
						}())
					}
					
					// manipulating all the least of properties into methods
					// and applying the given args to the context, otherwise returns 
					// context's own property value or the object if args not defined
					for(var i in context){
				
						if(!args){
							
							// returning the context property value,
							// the object value or function value if args not defined 
							return context[i][properties[propKey]]
						}

						try{
							
							// applying to the context all other property values that do not return an object instance
							context[i][properties[propKey]] = args
						}
						// ingoring invalid assignment to non context object
						catch(ex){}

					}
					
					return this
				}
			})
		})
		
		// manipulating functions from external defined properties 
		Object.keys(externalProps).forEach( function(propKey){
			
			var cbfn = externalProps[propKey]
			
			Object.defineProperty(obj_, propKey, {
				configurable: true,
				writable: true,
				value: function fn(arguments_){
				
					var context = context_ || this
					
					return cbfn.call(this, arguments, context)
				}
			})
		})
	
		// defining other custom properties
		Object.defineProperties(obj_, {
			'select': {
				configurable: true,
				value: function fn(args, opt, cb){
					
					var context = context_ || this
					
					if(!args && isNaN(args)){
			
						return this
					}
					
					if(opt){
						
						if(typeof args === 'number'){
							
							Elify(context[args], opt)
						}
				
						if(typeof args === 'string'){
							
							for(var i in context){
								
								var newContext = context[i].querySelector(args)
							
								if(newContext) {
									
									Elify(newContext, opt)
								}
							}
						}
	
						return this
					}
		
					if( typeof args === 'number' ){
						
						return Elify(context[args])
					}
					
					if(typeof args === 'string' ){
						//find element by args in current context
						var ctxCollection = []
					
						for(var i in context){
							
							//select by localName
							if(context[i].localName === args ){
						
								return Elify(context[i])
							}
					
							var newContext = context[i].querySelector(args)
					
						if(newContext)
							
							ctxCollection.push(newContext)
						}
						
						return Elify(ctxCollection)
					}
					
					return Elify(args)
				}
			},
			'appendTo': {
				configurable: true,
				value: function fn(args, opt, cb){
					
					var context = context_ || this,
					
					  newContext = Elify.selector(args),
						
					  ctxCol = []
						
					for(var i in context){
						
						for(var ai in newContext){
							
							if(context[i] instanceof HTMLElement){
							  
							  newContext[ai].appendChild(context[i])
							
					  		ctxCol.push(context[i])
							}
						}
					}
					
					return Elify(ctxCol, opt)
				}
			},
			'on':{
				configurable: true,
				value: function fn(evtArgs, cbFn){
					
					var context = context_ || this
					
					for(var i in context){
						
						if(evtArgs instanceof Object) {
						  
						  Object.keys(evtArgs).forEach( function(key){
						    
						    collectedEvent[key] = evtArgs[key]
						    
						    if(context[i] instanceof HTMLElement){
							  
							  //context[i]['on' + evtType] = collectedEvent[evtType]
							  
							   context[i].addEventListener(key, collectedEvent[key])
						  	}
						  })
						  
						  return 
						}
						
						evtArgs.trim().split(',').forEach( function(evtType){
						  
						  evtType = evtType.trimLR()
						  
							collectedEvent[evtType] = cbFn

							if(context[i] instanceof HTMLElement){
							  
							  //context[i]['on' + evtType] = collectedEvent[evtType]
							  
							  context[i].addEventListener(evtType, collectedEvent[evtType])
							}
							
						})
					}
					
					return this
				}
			},
			'off': {
			  configurable: true,
			  value: function(evtArgs){
			    
			    var context = context_ || this
					
					for(var i in context){
						
						if(evtArgs instanceof Object) {
						  
						  Object.keys(evtArgs).forEach( function(key){
						    
						    collectedEvent[key] = evtArgs[key]
						    
						    if(context[i] instanceof HTMLElement){
							  
							  //context[i]['on' + evtType] = collectedEvent[evtType]
							  
							   context[i].removeEventListener(key, collectedEvent[key])
						  	}
						  })
						  
						  return 
						}
						
						evtArgs.trim().split(',').forEach( function(evtType){
							
							evtType = evtType.trimLR() 
							
							if(context[i] instanceof HTMLElement){
							  
							  //context[i]['on' + evtType] = null 
							  context[i].removeEventListener(evtType, collectedEvent[evtType])
							}
						})
					}
					
			    return this
			  }
			},
			'trigger': {
				configurable: true,
				value: function fn(evtArgs){
					
					var context = context_ || this,
					
						evtObj = document.createEvent("Event")
				
					for(var i in context){
						
						// prepairing the event function for dispatching the given event type
            evtArgs.trim().split(',').forEach( function(evtType){
  						
  				  	evtObj.initEvent(evtType, true, true, {})
					
  						var evtFn = collectedEvent[evtType] 
  						
  						if(evtFn && context[i] instanceof HTMLElement){
  							
                context[i].dispatchEvent(evtObj)
                
  							//evtFn.call(context[i], evtObj)
  					}
  						else {
  							
  							throw new TypeError('Could not find event type "' + evtType + '" to trigger')
  					}
  						
            })
					}

					return this
				}
			},
			'get': {
				configurable: true,
				value: function fn(args){
					
					var context = context_ || this,
					
						splitedArgs = args.trimLR().trimWith(' ').split(' ')
						
					for(var i in context){
						
						var contextProp = context[i][splitedArgs[0]]
						
						// get style value
						if(contextProp instanceof CSSStyleDeclaration){
							
							return splitedArgs[1] ? contextProp[splitedArgs[1]] : contextProp
						}
						
						// get classList val
						if(contextProp instanceof DOMTokenList){
							
							return splitedArgs[1] ? contextProp.contains(splitedArgs[1]) : contextProp
						}
						
						// get children val
						if(contextProp instanceof HTMLCollection){
							
							var arg = /[0-9]/.test(splitedArgs[1]) ? parseInt(splitedArgs[1]) : splitedArgs[1]
							
							return splitedArgs[1] ? Elify(contextProp).select(arg) : Elify(contextProp)
						}
						
						// get attributes val
						if(contextProp instanceof NamedNodeMap){
							
							return splitedArgs[1] ? contextProp[splitedArgs[1]] : contextProp
						}
						
						// get attributes val
						if(contextProp instanceof DOMStringMap){
							
							return splitedArgs[1] ? contextProp[splitedArgs[1]] : contextProp
						}
						
						if(contextProp instanceof HTMLElement ){
							
							return contextProp
						}
						
						return context[i][args]
					}
				}
			},
			'set': {
				configurable: true,
				value: function fn(args){
					
					var context = context_ || this,
						
						splitedArgs = args.trimLR().trimWith(' ').split(' ')
					
					for(var i in context){
						
						var contextProp = context[i][splitedArgs[0]]
						
						// set style value
						if(contextProp instanceof CSSStyleDeclaration && (splitedArgs[1] && splitedArgs[2])){
							
							context[i].style[splitedArgs[1]] = splitedArgs[2]
							
							return Elify(context[i])//.style(splitedArgs[1] +' '+ splitedArgs[2])
						}
						
						// set classList val
						if(contextProp instanceof DOMTokenList && (splitedArgs[1] && splitedArgs[2])){
							
							if(splitedArgs[1] === 'add'){
								
								context[i].classList.add(splitedArgs[2])
							}
							
							if(splitedArgs[1] === 'remove'){
								
								context[i].classList.remove(splitedArgs[2])
							}
							
							if(splitedArgs[1] === 'toggle'){
								
								context[i].classList.toggle(splitedArgs[2])
							}
							
							if(splitedArgs[1] === 'replace'){
								
								context[i].classList.replace(splitedArgs[2])
							}
							
							if(splitedArgs[1] === 'contains'){
								
								return context[i].classList.contains(splitedArgs[2])
							}
							
							return Elify(context[i])//.classList(splitedArgs[1] +' '+ splitedArgs[2])
						}
						
						// set children val
						if(contextProp instanceof HTMLCollection && (splitedArgs[1])){
							
							var lestArgs = args.replace(splitedArgs[0],'').trimLR()
							
							var newChilds = Elify.selector(lestArgs)
							
							return Elify(context[i]).append(newChilds)
						}
						
						// set attributes val
						if(contextProp instanceof NamedNodeMap && (splitedArgs[1] && splitedArgs[2])){
							
							context[i].setAttribute(splitedArgs[1], splitedArgs[2])
							
							return Elify(context[i])
						}
						
						// set dataset val
						if(contextProp instanceof DOMStringMap && (splitedArgs[1] && splitedArgs[2])){
							
							context[i].dataset[splitedArgs[1]] = splitedArgs[2]
							
							return Elify(context[i])
						}
						
						if(contextProp instanceof HTMLElement ){
							
							return Elify(contextProp)
						}
						
						context[i][splitedArgs[0]] = splitedArgs[1]
					}
					
					return this
				}
			},
			'cssPseudo': {
			  configurable: true,
			  writable: true,
			  value: function(pseudo, ob){
			    
			    var context = this.attributes('set el-data btn'),
        
            attrVal = this.attributes('get el-data'),
         
            css = document.createElement('style'),
           
            cssText = ""
          
          Object.keys(ob).forEach( function(val){
            
            ob[val] = val === 'content' ? '"'+ ob[val] +'"' : ob[val]
            
            cssText += '[el-data="' + attrVal + '"]:' + pseudo + '{' + val + ':' + ob[val] + ';}' 
              
          })
          
          if(css.styleSheet){
            
            css.styleSheet.cssText = cssText
          }
          else{
            
            var cssTextNode = document.createTextNode(cssText)
            
            css.appendChild(cssTextNode)
            
            //css.innerText = cssText
          }
          
          this.append(css)
        
			    return this
			  }
			},
			'toElement': {
				configurable: true,
				value: function fn(options){
					
					var context = context_ || this
					
					return context[0]
				}
			},
			'toString': {
				configurable: true,
				value: function fn(){
					
					var context = context_ || this,
						toString = ''
						
					for(var i in context){
						
						toString += context[i].outerHTML
					}
			
					return toString
				}
			}
		})
		
		// remove properties from the inherited prototype
		Object.keys(removedProps).forEach( function(propKey){
		
			delete Elify.prototype[propKey]
		})
		
	}
	
	/** extending and defining jquery functions along with Elify functions
	 * @return {boolean} returns a condition in which Elify is associated to jQuery functions
	 */
	Elify.$ = Elify.jQuery = function _(args){
		
		var isJqueryObj =  window.$ && $.fn && jQuery.fn
		
		if(isJqueryObj){
			
			// using jquery's 'extend' property to extend its own properties
			// to Elify's prototype
			Elify.prototype = $.extend({}, Elify.prototype, $.fn)
			
			// externalProps = $.extend({}, Elify.prototype, $.fn)
			// binding properties to jquery so they can be chained together in 
			// Elify as well as in jquery
			Elify.bindProperties($.fn)
			
			if(args){
				
				return $(args)
			}
		}
		
		return isJqueryObj ? true : false
	}
	
	/** creating/construction of element object as custom reusable objects/components for new instance
	 *
	 * @param {keyVal} key value to determine element object global name or tag names
	 * @param {keyOptions} initialize/determine key options to be assigned to the element object
	 * @param {callbackFn} a callback function for proceeding construction of elment object
	 */
	Elify.create = function(keyVal, keyOptions, callbackFn, ns){
		
		// turning key value into iteratable collection
		var args = 
		
				// key value by a string type splited by white-Space or comma (',')
				typeof keyVal === 'string' ? keyVal.trimLR().split(/\s+|\,/g) :
				
				// key values by an object type
				typeof keyVal === 'object' && !Array.isArray(keyVal) ? Object.keys(keyVal) :
				// or key value by an array itself
				keyVal,
			
			createComp = function(tagVal){
				
				// the argument value
				var argVal = keyVal[tagVal],
						// passing the second arguments as key options
			      keyOptions_ = keyOptions || {}
				// manipulating a constructor's alike copy as of Elify constructor
				function Elify_(options){
				
					var optionalArgs = arguments
				
					// the context is/as the base element in the constructor
					var context = function(){
						
						var classname = tagVal.toLowerCase()
						
						if( keyVal instanceof Object){
					
							// element by the argument value of an array type
							if(argVal instanceof Object && Array.isArray(argVal) ){

								var selectorVal = argVal[0],
									optionalVal = argVal[1] || {}
									
								keyOptions_ = optionalVal
                
                // returning a cloned copy for each new instance
								return Elify([selectorVal], optionalVal).attributes('set el-data ' + classname).clone()
							}
							
							if(argVal instanceof Object){
						   
						    // returning a cloned copy for each new instance
								return Elify(Elify.selector(argVal)).attribute('set el-data ' + classname).clone()
							}
					  
					    // returning a cloned copy for each new instance
							return Elify(Elify.selector(argVal)).attributes('set el-data ' + classname).clone()
						}
						else {
						
							var element = document.createElement(tagVal)
								
								// classname case sensitive to rower case

							// element classname added by default
							element.classList.add(classname)
						 
						 	element.setAttribute('el-data', classname)

							return Elify(element)
						}
					}
				
					context = context()
				
					// optional arguments set inline with key options as optional parameter
					Object.keys(keyOptions_).forEach( function(key, i){
							 
					    keyOptions_[key] = optionalArgs[i] ? optionalArgs[i] : keyOptions_[key]
					})
				
					if(callbackFn || keyOptions instanceof Function ){
						     	
						if(optionalArgs[0] instanceof Object){
							
							var op = Object.assign({}, keyOptions_, optionalArgs[0] )
							
							callbackFn.call(context, op)
								
							return context
						}
						
						callbackFn.call(context, keyOptions_)
							
						return context
					}
					
					if(optionalArgs[0] instanceof Object){
					
						return Elify(context, optionalArgs[0])
					}

					return Elify(context, keyOptions_)
				}
				
				Elify_.toString = function(){ return '[Object Elify' + tagVal + ']' }

				return Elify_
			}
	
		// creating and initialize Elify objects/components grobally in window or given namespace
		args.forEach( function(comp){
			
			if(ns){
			  
			  // initialize Elify components/objects in the given namespace
			  ns[comp] = Elify[comp] = createComp(comp)
			}
			else {
			  
			  // initialize Elify components/objects in the document window 
		  	window[comp] = Elify[comp] = createComp(comp)
			}
			  
		})

	}

	/** define custom properties
	 * @param {propName} a property name
	 * @param {fn} a callback function
	 */
	Elify.defineProperty = function(propName, fn){
		
		function define(pn, f){
			
			Object.defineProperty(Elify.prototype, pn, {
				configurable:true,
				value: function(arguments_){
		
					return f.call(this, arguments, context)
				}
			})
		}
		
		// passing first arguments type of object ({}) to define multiple properties
		if(arguments.length === 1 && arguments[0].constructor.name === 'Object'){
			
			var args = arguments[0]
			
			Object.keys(args).forEach( function( propName_){
			    
				var fn_ = args[propName_]
				
				externalProps[propName_] = fn_
				
				define(propName_, fn_)
			})

			return
		}
		
		externalProps[propName] = fn
		
		define(propName, fn)
	}
	
	/** redefine a property with a favourable name to shorten or give a better naming
	 * of functionality
	 * @param {propName} a property name to redefine
	 * @param {newPropName} a new property name to define
	 */
	Elify.redefineProperty = function(propName, newPropName){
		
		function redefine(propName_, newPropName_){
			
			var oldProp = Elify.prototype[propName_]
			
			if(Elify.prototype[propName_]){
		
				properties[newPropName_] = propName_
				//redefinedProps[newPropName_] = propName_
				
				return Elify.prototype[newPropName_] = function fn(arguments_){
					
					//return Elify(this)[oldProp](arguments_)
					return Elify(this)[newPropName_] = oldProp(arguments_)
				}
			}
			
			else{
				
				throw new TypeError('Could not redefine undefined property "' + propName_ + '" to "' + newPropName_ + '"' )
			}
		}
		
		// passing first arguments type of object ({}) to redefine multiple properties
		if(arguments.length === 1 && arguments[0].constructor.name === 'Object'){
			
			var args = arguments[0]
			
			return Object.keys(args).forEach( function( propName_){
				
				var newPropName_ = args[propName_]
			
				return redefine(propName_, newPropName_)
			})
		}
		
		return redefine(propName, newPropName)
	}
	
	/** rename a property with a favourable name to shorten or give a better naming
	 * of functionality
	 *
	 * @param {propName} a property name to rename
	 * @param {newPropName} a new property name to be given
	 */
	Elify.renameProperty = function(propName, newPropName){
		
		function rename(pn, newPn){
			
			if(Elify.prototype[pn]){
			
				renamedProps[pn] = pn
				
				Elify.redefineProperty(pn, newPn)
			
				Elify.removeProperty(pn)
				
				return true
			}
			
			// throw new TypeError('Could not rename undefined property "'+ propName + '" to "'+ newPropName + '" ')
			
			return false
		}
		
		if(arguments.length === 1 && arguments[0].constructor.name === 'Object'){
			
			var args = arguments[0]
			
			return Object.keys(args).forEach( function( propName_){
				
				var newPropName_ = args[propName_]
			
				return rename(propName_, newPropName_)
			})
		}
		
		return rename(propName, newPropName)
	}
	
	/** remove a property along with its functionalities
	 * @param {propName} a property name to remove
	 */
	Elify.removeProperty = function(propName){

		arguments[0].split(/\,|\s+/).forEach( function(pn){
			
			if(Elify.prototype[pn]){
		
				// assigning properties to be removed from inherited Elify prototypes
				removedProps[pn] = Elify.prototype[pn] || pn
				
				delete Elify.prototype[pn]
		
				return true
			}
			
			//throw new TypeError('Could not remove undefined property "'+ propName + '"')
			
			return false
		})
	}
	
	Elify.toString = function toString(){ return '[Object Elify]' }
	
	// binding properties to Elify prototype
	Elify.bindProperties(Elify.prototype)
	
	// initiating Elify directly from context object prototypes
	Array(HTMLElement.prototype, NodeList.prototype, HTMLCollection.prototype).forEach( function(proto){
		
		proto.el = proto.elify = function(args, keyOptions){
			
			keyOptions = keyOptions || {}
			
			// passing first arguments object ({}) as optional argument
			if(typeof args === 'object' && args.constructor.name === 'Object'){
				
				return Elify(this, args)
			}
			
			// appliying key options directly to this object context
			
			var thisObj = this
			
			Object.keys(keyOptions).forEach( function(key){
				
				thisObj[key] = keyOptions[key]
			})
			
			// creates and Elify a custom object/component with the given name 'args',
			// otherwise Elify this context object
			var obj = {}
			
			obj[args] = this
			
			return args ? Elify(obj, keyOptions) : Elify(this)
		}
		
	}) 
  
  return Elify
})))