/* ALL Create by LamberthRumpaidus */
(function(root){
'use strict';
class MaterialLibrary{
 constructor(gl){
  this.gl=gl;this.ready=0;this.failed=0;
  this.entries=[this.create('assets/textures/ground_moss_1p5k.png'),this.create('assets/textures/stone_path_1p5k.png')];
 }
 create(path){
  const g=this.gl,tex=g.createTexture();
  g.bindTexture(g.TEXTURE_2D,tex);
  g.texImage2D(g.TEXTURE_2D,0,g.RGBA,1,1,0,g.RGBA,g.UNSIGNED_BYTE,new Uint8Array([128,128,128,255]));
  g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MIN_FILTER,g.LINEAR);
  const image=new Image();
  image.onload=()=>{try{
    const limit=Math.min(1024,g.getParameter(g.MAX_TEXTURE_SIZE));
    const size=2**Math.floor(Math.log2(Math.min(limit,image.width,image.height)));
    const surface=document.createElement('canvas');surface.width=size;surface.height=size;
    surface.getContext('2d').drawImage(image,0,0,size,size);
    const active=g.getParameter(g.ACTIVE_TEXTURE);g.activeTexture(g.TEXTURE4);const prev=g.getParameter(g.TEXTURE_BINDING_2D);
    try{g.bindTexture(g.TEXTURE_2D,tex);g.texImage2D(g.TEXTURE_2D,0,g.RGBA,g.RGBA,g.UNSIGNED_BYTE,surface);g.generateMipmap(g.TEXTURE_2D);
    g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MIN_FILTER,g.LINEAR_MIPMAP_LINEAR);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MAG_FILTER,g.LINEAR);this.ready++;}
    finally{g.bindTexture(g.TEXTURE_2D,prev);g.activeTexture(active);}
   }catch(error){this.failed++;console.warn('Material texture:',path,error);}};
  image.onerror=()=>{this.failed++;};image.src=path;return tex;
 }
 bind(loc,quality){
  const g=this.gl;for(let i=0;i<2;i++){g.activeTexture(g.TEXTURE4+i);g.bindTexture(g.TEXTURE_2D,this.entries[i]);g.uniform1i(i?loc.stoneMap:loc.mossMap,4+i);}
  g.uniform1f(loc.materialDetail,quality==='low'?0:this.ready===2?1:0);g.activeTexture(g.TEXTURE0);
 }
}
root.LandlordMaterialLibrary=MaterialLibrary;
})(globalThis);
