// ==UserScript==
// @name ApplyAnnotations
// @description  Foo
// @author David M. Weigl
// @homepageURL https://github.com/musicog/ApplyAnnotations
// @version  1
// @run-at document-idle
// @include  *
// @require  http://www.verovio.org/javascript/latest/verovio-toolkit.js
// ==/UserScript==

function fetchAndApply() { 
   console.log("button clicked");
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
            	const fragment = targetId.substr(targetId.lastIndexOf("#")+1)
              // any annotation bodies... (might be none)
              const bodies = anno["http://www.w3.org/ns/oa#hasBody"] || [];
              // the target DOM element
            	const element = document.querySelector("#" + fragment);
              // obtain the overlay div for this element
              let overlay = document.querySelector("#overlay-"+fragment);
              console.log("Selector overlay ", overlay);
              if(!overlay) { 
                // don't have one yet - so we have to build one
                const boundRect = element.getBoundingClientRect();
                console.log("bounding rect: ", boundRect);
                overlay = document.createElement("div");
                overlay.setAttribute("id", "overlay-" + fragment);
                /*overlay.setAttribute("style", 
                                     "position:absolute;" +
                                     "left:" + Math.floor(boundRect.left) + "px;" +
                										 "top:" + Math.floor(boundRect.top) + "px;" +
                										 "width:" + Math.ceil(boundRect.right - boundRect.left) + "px;" + 
                										 "height:" + Math.ceil(boundRect.bottom - boundRect.top) + "px;" + 
                                     "background: rgba(255,0,0,0.8);" +
                                     "z-index: 1;");*/
                overlay.style.position = "absolute";
                overlay.style.left = Math.round(boundRect.left + window.scrollX) + "px";
                overlay.style.top = Math.round(boundRect.top + window.scrollY) + "px";
                overlay.style.width = Math.round(boundRect.right - boundRect.left) + "px";
                overlay.style.height = Math.round(boundRect.bottom - boundRect.top) + "px";
                overlay.style["z-index"] = 1;
                // insert it into the DOM
                console.log("inserting overlay: ", overlay);
                document.body.insertBefore(overlay, document.body.firstChild);
              }
                
              motivations.map((motivation) => { 
              	// now do stuff to the target element, according to the annotation's motivation
              	switch(motivation["@id"]) {
               	 case "http://www.w3.org/ns/oa#highlighting":
										// fill in the element
                    console.log("HIGHLIGHTING: ", anno);
            				overlay.style.background = "rbga(255,0,0,0.8)";
                    break;
               	 case "http://www.w3.org/ns/oa#linking":
                    console.log("LINKING: ", anno);
               	   // assuming there is at least one body attached to the annotation...
               	   if(bodies.length) { 
               	     // make the target clickable, linking to the (first) body URI
               	     overlay.addEventListener("click", function() { 
               	       window.location = bodies[0]["@id"] || window.location;
               	     }, true);
               	     // and turn the cursor into a pointer as a hint that it's clickable
               	     overlay.style.pointer = "cursor";
               	   }
               	   break;
               	 case "http://www.w3.org/ns/oa#describing":
                 	console.log("DESCRIBING: ", anno);
               	 	// assuming there is at least one body attached to the annotation...
               	   if(bodies.length) { 
               	     // set the body (presumed to be a literal) to be the element's title text
                     console.log("setting title attribute on ", element, " to ", bodies[0]["@value"]);
               	     overlay.setAttribute(title, bodies[0]["@value"] || "");
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
