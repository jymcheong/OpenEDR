//@type
d

//parameters
obj

//name
removeSpaceFromKey

//language
javascript

//code
// find whitespace in key string; {key,value} database property name won't accept space
var notValid = /[\W_]+/g 
if (typeof obj !== "object") return obj;
for (var prop in obj) {
	if (obj.hasOwnProperty(prop)) {
    	obj[prop.replace(notValid, "")] = removeSpaceFromKey(obj[prop]);
        if (notValid.test(prop)) {
        	delete obj[prop];
		}
	}
}
return obj;

