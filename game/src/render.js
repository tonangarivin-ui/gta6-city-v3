// Perspective canvas renderer for Solara's coastal boulevard and its depth-sorted city.
import { project } from './math3d.js';
export const SCREEN_TITLE = 'start', SCREEN_PLAY = 'play', SCREEN_PAUSED = 'paused', SCREEN_OVER = 'over';
const facades = ['#e9a06e','#d6bd8b','#86aaa0','#d08b75','#c9b58e','#79a7a4'];
const shade = (hex, delta) => '#' + [16,8,0].map(s => Math.max(0, Math.min(255, (parseInt(hex.slice(1),16)>>s&255)+delta)).toString(16).padStart(2,'0')).join('');

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d'); let w=0,h=0,dpr=1;
  function resize(){dpr=Math.min(2,devicePixelRatio||1);w=innerWidth;h=innerHeight;canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);}
  addEventListener('resize',resize);resize();
  const point=(camera,lateral,forward,z=0)=>{const c=Math.cos(camera.heading),s=Math.sin(camera.heading);return project({x:camera.x+lateral*c+forward*s,y:camera.y-lateral*s+forward*c,z},camera,w,h);};
  const poly=(points,color)=>{ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(points[0].x,points[0].y);for(let i=1;i<points.length;i++)ctx.lineTo(points[i].x,points[i].y);ctx.closePath();ctx.fill();};
  const line=(a,b,color,width=1)=>{ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();};
  function drawBuilding(camera,x,d,width,depth,height,color){
    const b=[[-width/2,d],[width/2,d],[width/2,d+depth],[-width/2,d+depth]].map(([a,z])=>point(camera,x+a,z));
    const t=[[-width/2,d],[width/2,d],[width/2,d+depth],[-width/2,d+depth]].map(([a,z])=>point(camera,x+a,z,height));
    if(b[0].y>h+20||t[0].y<0)return;
    // Front, receding side, and roof are separate quads, not flat skyline strips.
    poly([b[0],b[1],t[1],t[0]],color);poly([b[1],b[2],t[2],t[1]],shade(color,-34));poly([t[0],t[1],t[2],t[3]],shade(color,18));
    const rows=Math.min(7,Math.max(2,Math.floor(height/42))), cols=Math.min(5,Math.max(2,Math.floor(width/24)));
    ctx.fillStyle='#ffe0a0';
    for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const q=point(camera,x-width*.39+c*width*.78/(cols-1),d+.3,height*(.16+r*.7/rows));const s=Math.max(1,Math.min(5,q.scale*2.7));ctx.fillRect(q.x-s/2,q.y-s/2,s,s*1.2);}
  }
  function drawPalm(camera,x,d){const base=point(camera,x,d),top=point(camera,x,d,34);line(base,top,'#76563d',Math.max(1,base.scale*4));for(let i=-2;i<=2;i++){const end=point(camera,x+i*9,d,38-Math.abs(i)*3);line(top,end,'#267c68',Math.max(1,base.scale*5));}}
  function drawCar(q,color,size){const rw=Math.max(3,Math.min(55,size)),rh=rw*.48;ctx.fillStyle='rgba(4,17,22,.55)';ctx.beginPath();ctx.ellipse(q.x,q.y+rh*.45,rw*.65,rh*.38,0,0,Math.PI*2);ctx.fill();ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(q.x-rw*.55,q.y);ctx.lineTo(q.x-rw*.37,q.y-rh*.48);ctx.lineTo(q.x+rw*.35,q.y-rh*.48);ctx.lineTo(q.x+rw*.58,q.y);ctx.lineTo(q.x+rw*.52,q.y+rh*.22);ctx.lineTo(q.x-rw*.52,q.y+rh*.22);ctx.closePath();ctx.fill();ctx.fillStyle='#b8d4d1';ctx.fillRect(q.x-rw*.27,q.y-rh*.42,rw*.54,rh*.23);}
  function drawWorld(state){
    const player=state.player,back=Number.isFinite(state.distance)?state.distance:78,height=Number.isFinite(state.height)?state.height:118,camera={x:player.x,y:player.y,heading:player.heading,back,height};
    const projectGround=(lateral,forward,z=0)=>point(camera,lateral,forward,z); // world-to-screen projection for every ground object.
    const horizon=h*.37,sky=ctx.createLinearGradient(0,0,0,horizon);sky.addColorStop(0,'#55b6ce');sky.addColorStop(1,'#ffd08c');ctx.fillStyle=sky;ctx.fillRect(0,0,w,horizon+2);
    const sun=ctx.createRadialGradient(w*.78,h*.19,2,w*.78,h*.19,Math.min(w,h)*.13);sun.addColorStop(0,'rgba(255,244,196,.95)');sun.addColorStop(1,'rgba(255,202,112,0)');ctx.fillStyle=sun;ctx.fillRect(w*.6,0,w*.4,h*.42);
    ctx.fillStyle='#2c7f87';ctx.fillRect(0,horizon,w,h-horizon);
    // Sand, sidewalk, and asphalt are projected ground-plane trapezoids.
    poly([point(camera,-520,4),point(camera,520,4),point(camera,520,1450),point(camera,-520,1450)],'#d8b984');
    poly([point(camera,-165,2),point(camera,165,2),point(camera,165,1450),point(camera,-165,1450)],'#303a3d');
    for(const side of [-1,1]){line(point(camera,side*165,2),point(camera,side*165,1450),'#f1d49a',2);line(point(camera,side*193,2),point(camera,side*193,1450),'#b99363',Math.max(1,point(camera,side*193,500).scale*2));}
    // Perspective lane dashes crowd toward the vanishing point.
    for(let d=24;d<1400;d*=1.31){const dash=Math.max(3,d*.12),q=point(camera,0,d),a=point(camera,-3,d),b=point(camera,3,d+dash);line(a,b,'#f6dfae',Math.max(1,q.scale*3.4));}
    // Depth sort all skyline boxes so nearer architecture occludes distant blocks.
    const objects=[];for(let d=74;d<1500;d+=88)for(const side of [-1,1]){const seed=Math.floor(d/88)+(side>0?3:0),x=side*(235+(seed%3)*24),depth=45+seed%30;objects.push({d,draw:()=>drawBuilding(camera,x,d,74+(seed*9)%40,depth,70+(seed*47)%285,facades[Math.abs(seed*7)%facades.length])});}
    for(const o of objects.sort((a,b)=>b.d-a.d))o.draw();
    for(let d=80;d<1250;d+=160)drawPalm(camera,-215,d);
    // Traffic, pedestrians, and patrols share the projected ground plane and depth scale.
    for(const car of [...(state.cars??[]),...(state.patrols??[])]){const q=point(camera,car.x,car.y,2);if(q.depth>10&&q.depth<1450){drawCar(q,car.color,16*q.scale);if(state.patrols?.includes(car)){ctx.fillStyle=state.policeFlash?'#ff3948':'#39cfff';ctx.fillRect(q.x-5,q.y-10,4,3);ctx.fillRect(q.x+2,q.y-10,4,3);}}}
    for(const person of state.pedestrians??[]){const q=point(camera,person.x,person.y,0),r=Math.max(2,3*q.scale);ctx.fillStyle='#233e42';ctx.beginPath();ctx.arc(q.x,q.y-r*2,r,0,7);ctx.fill();ctx.fillRect(q.x-r/2,q.y-r*1.2,r,r*2.5);}
    if(state.shots>0){ctx.fillStyle='#ffe385';ctx.beginPath();ctx.arc(w*.58,h*.72,10+Math.sin(state.time*35)*5,0,7);ctx.fill();}
    if(state.mapOpen){ctx.fillStyle='rgba(10,27,32,.94)';ctx.fillRect(w*.28,h*.12,w*.44,h*.68);ctx.strokeStyle='#d9bd88';for(let i=1;i<6;i++){ctx.beginPath();ctx.moveTo(w*.28+i*w*.44/6,h*.12);ctx.lineTo(w*.28+i*w*.44/6,h*.8);ctx.moveTo(w*.28,h*.12+i*h*.68/6);ctx.lineTo(w*.72,h*.12+i*h*.68/6);ctx.stroke();}ctx.fillStyle='#ffcf75';ctx.beginPath();ctx.arc(w*.5,h*.47,7,0,7);ctx.fill();}
      // Motion trails sit behind the near car at high speed.
      if(state.speed>45){ctx.strokeStyle='rgba(255,226,168,.42)';for(let i=0;i<9;i++){const x=w*(.16+i*.085);line({x,y:h*.78},{x:x+(x<w/2?-20:20),y:h*.98},'rgba(255,226,168,.32)',2);}}
      // Camera-space long shadows cast across the receding boulevard.
      for(const side of [-1,1]){const a=point(camera,side*130,160),b=point(camera,side*120+38,235),c=point(camera,side*120+48,245),d=point(camera,side*130+8,170);poly([a,b,c,d],'rgba(19,30,28,.16)');}
      const px=w*.5, py=h*.82,cw=Math.min(w,h)*.105;
      if(state.wanted){ctx.strokeStyle='#f43148';ctx.lineWidth=3;ctx.strokeRect(px-cw*.65,py-cw*.02,cw*1.3,cw*.2);}
      if(state.player.inVehicle===false){ctx.fillStyle='#f3d7a2';ctx.beginPath();ctx.arc(px,py-cw*.18,cw*.12,0,7);ctx.fill();}
      if(state.speed>1){ctx.fillStyle='#d8eadf';ctx.font='700 13px system-ui';ctx.fillText(`${state.speed} MPH`,w-102,h-178);}
      // Player vehicle anchors the near foreground; tapered silhouette reads as third-person driving.
    ctx.fillStyle='rgba(5,15,18,.58)';ctx.beginPath();ctx.ellipse(px,py+cw*.25,cw*.76,cw*.34,0,0,7);ctx.fill();ctx.fillStyle='#ef9650';ctx.beginPath();ctx.moveTo(px-cw*.62,py+cw*.22);ctx.lineTo(px-cw*.42,py-cw*.2);ctx.lineTo(px-cw*.21,py-cw*.46);ctx.lineTo(px+cw*.21,py-cw*.46);ctx.lineTo(px+cw*.44,py-cw*.18);ctx.lineTo(px+cw*.62,py+cw*.22);ctx.closePath();ctx.fill();ctx.fillStyle='#a8d4d1';ctx.beginPath();ctx.moveTo(px-cw*.3,py-cw*.17);ctx.lineTo(px-cw*.17,py-cw*.38);ctx.lineTo(px+cw*.17,py-cw*.38);ctx.lineTo(px+cw*.3,py-cw*.17);ctx.fill();
    return camera;
  }
  function overlay(state,screen){
    ctx.fillStyle='rgba(10,27,32,.82)';ctx.fillRect(22,20,258,104);ctx.fillStyle='#f6f2e7';ctx.font='700 14px system-ui';ctx.fillText('SOLARA  /  SALT ON THE WIND',38,45);ctx.fillStyle='#ffc66d';ctx.font='700 21px system-ui';ctx.fillText(`$ ${state.cash.toLocaleString()}`,38,77);ctx.fillStyle='#69d1b1';ctx.fillRect(38,91,150,9);ctx.fillStyle='#e8eee7';ctx.font='13px system-ui';ctx.fillText('♥ 88',201,101);
    ctx.fillStyle='rgba(10,27,32,.8)';ctx.fillRect(w-161,22,137,137);ctx.strokeStyle='#eee1bd';ctx.strokeRect(w-161,22,137,137);ctx.fillStyle='#276e78';ctx.fillRect(w-157,26,129,129);ctx.fillStyle='#ddc292';ctx.fillRect(w-157,100,129,55);ctx.fillStyle='#434b4d';ctx.fillRect(w-157,116,129,20);ctx.fillStyle='#fff0bd';ctx.beginPath();ctx.moveTo(w-93,97);ctx.lineTo(w-88,78);ctx.lineTo(w-83,97);ctx.fill();
    ctx.fillStyle='#ffc66d';ctx.font='22px system-ui';ctx.fillText('★'.repeat(state.wanted??0)+'☆'.repeat(5-(state.wanted??0)),38,177);
    ctx.fillStyle='rgba(10,27,32,.83)';ctx.fillRect(22,h-110,Math.min(w-44,650),82);ctx.fillStyle='#ffc66d';ctx.font='700 12px system-ui';ctx.fillText(`ACTIVE CONTRACT  ·  ${state.missionStep??'1/5'}`,40,h-81);ctx.fillStyle='#f5f1e6';ctx.font='16px system-ui';ctx.fillText(state.objective??'Meet Ivo at the Mariner Diner.',40,h-53);
    ctx.fillStyle='#d7e6df';ctx.font='12px system-ui';ctx.textAlign='right';ctx.fillText('WASD MOVE   E STEAL / EXIT   SHIFT SPRINT   CLICK FIRE   TAB PAUSE   M MAP',w-24,h-22);ctx.textAlign='left';
    if(screen!==SCREEN_PLAY){ctx.fillStyle='rgba(4,17,22,.43)';ctx.fillRect(0,0,w,h);ctx.textAlign='center';ctx.fillStyle='#fff1d3';ctx.font=`900 ${Math.min(70,w*.09)}px system-ui`;ctx.fillText(screen===SCREEN_TITLE?'SOLARA':screen===SCREEN_PAUSED?'PAUSED':'CITY LIMITS',w/2,h*.39);ctx.fillStyle='#ffc66d';ctx.font='700 19px system-ui';ctx.fillText(screen===SCREEN_TITLE?'LAST LIGHT':screen===SCREEN_PAUSED?'P TO CONTINUE':'PRESS ENTER TO RETURN',w/2,h*.45);ctx.fillStyle='#fff1d3';ctx.font='15px system-ui';ctx.fillText(screen===SCREEN_TITLE?'PRESS ANY KEY TO ENTER THE CITY':'A COASTAL CRIME STORY  /  MARINA ALTA',w/2,h*.58);ctx.textAlign='left';}
  }
  return {draw(state,screen){ctx.clearRect(0,0,w,h);drawWorld(state);overlay(state,screen);}};
}
