document.addEventListener("scroll", ()=>{
  const waves = document.getElementById("waveAnimation");
  var scrolled = waves.scrollTop;
  waves.style.marginTop = (0-(scrolled*.25)) + 'px';
//   alert("works");
})
