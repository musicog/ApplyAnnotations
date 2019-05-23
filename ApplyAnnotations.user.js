// ==UserScript==
// @name ApplyAnnotations
// @description  Foo
// @author David M. Weigl
// @homepageURL https://github.com/musicog/VerovioThis
// @version  1
// @run-at document-idle
// @include  *
// @require  http://www.verovio.org/javascript/latest/verovio-toolkit.js
// ==/UserScript==

function fetchAndApply() { 
   const theUri = document.getElementById('__applyannotations_userscript_url_input').value;
   // GET the content at the specified URI, as JSON-LD
   fetch(theUri, { headers: { "Accept": "application/ld+json"} }).then((response) => {
     // read out the json inside
     response.json().then( (annotations) => { 
       // for each annotation we find
       annotations.map( (anno) => { 
         // assuming it has at least one target (it ought to...)
        	if("http://www.w3.org/ns/oa#hasTarget" in anno) {
            // iterate over each target
            anno["http://www.w3.org/ns/oa#hasTarget"].map((target) => {
              // motivation tells us what to do with the target            
              const motivations = anno["http://www.w3.org/ns/oa#motivation"] || [];
              // expect the target ID to end in a fragment identifier (e.g. #note-12345)
              const targetId = target["@id"]
            	const fragment = targetId.substr(targetId.lastIndexOf("#"))
              // any annotation bodies... (might be none)
              const bodies = anno["http://www.w3.org/ns/oa#hasBody"] || [];
              // the target DOM element
            	const element = document.querySelector(fragment);
              motivations.map((motivation) => { 
              	// now do stuff to the target element, according to the annotation's motivation
              	switch(motivation["@id"]) {
               	 case "http://www.w3.org/ns/oa#highlighting":
										// fill in the element
                    console.log("HIGHLIGHTING: ", anno);
            				element.style.fill = "darkorange";
                    break;
               	 case "http://www.w3.org/ns/oa#linking":
                    console.log("LINKING: ", anno);
               	   // assuming there is at least one body attached to the annotation...
               	   if(bodies.length) { 
               	     // make the target clickable, linking to the (first) body URI
               	     element.addEventListener("click", function() { 
               	       window.location = bodies[0]["@id"] || window.location;
               	     }, true);
               	     // and turn the cursor into a pointer as a hint that it's clickable
               	     element.style.pointer = "cursor";
               	   }
               	   break;
               	 case "http://www.w3.org/ns/oa#describing":
                 	console.log("DESCRIBING: ", anno);
               	 	// assuming there is at least one body attached to the annotation...
               	   if(bodies.length) { 
               	     // set the body (presumed to be a literal) to be the element's title text
                     console.log("setting title attribute on ", element, " to ", bodies[0]["@value"]);
               	     element.setAttribute(title, bodies[0]["@value"] || "");
               	   }
               	   break;
               	 default: 
               	   console.log("sorry, don't know what to do for this annotation ", anno, " with motivation ", motivation);
              	}
              });
            })
          }
       })
     })
   });
}
  
let annoUrlBox = document.createElement("span");
annoUrlBox.innerHTML =	"Apply Web Annotation: <input type='text' name='anno' id='__applyannotations_userscript_url_input'/> ";
let applyButton = document.createElement("input");
applyButton.setAttribute("type", "button");
applyButton.setAttribute("value", "Apply");
applyButton.addEventListener("click", fetchAndApply, true );
  
document.body.insertBefore(applyButton, document.body.firstChild);
document.body.insertBefore(annoUrlBox, document.body.firstChild);
