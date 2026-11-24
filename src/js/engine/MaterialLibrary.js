/* ALL Create by LamberthRumpaidus */
(function(root){
'use strict';
class MaterialLibrary{
 constructor(gl){
  this.gl=gl;this.ready=0;this.failed=0;
  this.extended=typeof WebGL2RenderingContext!=='undefined'&&gl instanceof WebGL2RenderingContext;
  this.paths=['ground_moss_1p5k.png','stone_path_1p5k.png',...(this.extended?['bamboo_bark_1p5k.png','bamboo_leaves_1p5k.png','water_soft_1p5k.png']:[])];
  this.entries=this.paths.map(path=>this.create('assets/textures/'+path));
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
  const g=this.gl,slots=[4,5,7,8,9],uniforms=[loc.mossMap,loc.stoneMap,loc.barkMap,loc.leafMap,loc.waterMap];
  for(let i=0;i<this.entries.length;i++){g.activeTexture(g.TEXTURE0+slots[i]);g.bindTexture(g.TEXTURE_2D,this.entries[i]);g.uniform1i(uniforms[i],slots[i]);}
  g.uniform1f(loc.materialDetail,quality==='low'?0:this.ready===this.entries.length?1:0);g.activeTexture(g.TEXTURE0);
 }
}
root.LandlordMaterialLibrary=MaterialLibrary;
})(globalThis);
