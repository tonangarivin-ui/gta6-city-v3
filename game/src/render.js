import { project } from './math3d.js';
const COLORS = { ocean: '#176a83' };
export const SCREEN_TITLE = 'start', SCREEN_PLAY = 'play', SCREEN_PAUSED = 'paused', SCREEN_OVER = 'over';

const palette = ['#f4a261','#e76f51','#d9c69b','#8fb8a0','#d7e3e8','#c58968','#e8d291'];

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  let w = 0, h = 0, dpr = 1;
  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1); w = innerWidth; h = innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  window.addEventListener('resize', resize); resize();
  const p = (x,y,z,camera) => project({x,y,z},camera,w,h);
  function line(a,b,color,width=1) { ctx.strokeStyle=color; ctx.lineWidth=width; ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke(); }
  function polygon(points,color) { ctx.fillStyle=color; ctx.beginPath(); ctx.moveTo(points[0].x,points[0].y); for(let i=1;i<points.length;i++)ctx.lineTo(points[i].x,points[i].y); ctx.closePath(); ctx.fill(); }
  function drawBox(x,y,bw,bd,bh,camera,color,cp) {
    const corners=[[-bw/2,y],[bw/2,y],[bw/2,y+bd],[-bw/2,y+bd]].map(([a,b])=>cp(a,b));
    const top=corners.map((q,i)=>cp([-bw/2,bw/2,bw/2,-bw/2][i],y+[0,0,bd,bd][i],bh));
    if(Math.max(...corners.map(q=>q.y))<0||Math.min(...corners.map(q=>q.y))>h)return;
    const side1=[corners[1],corners[2],top[2],top[1]], side2=[corners[2],corners[3],top[3],top[2]];
    polygon(side1,shade(color,-22)); polygon(side2,shade(color,-38)); polygon(top,shade(color,17));
    const center=cp(0,y+bd/2,bh), scale=center.scale;
    if(scale>0.11) {
      const winW=Math.max(1,Math.min(6,scale*5)), winH=winW*1.25;
      ctx.fillStyle='#f7d79a';
      for(let row=0;row<Math.min(5,Math.floor(bh/42));row++) for(let col=0;col<3;col++) {
        const q=cp(-bw*.3+col*bw*.27,y+bd*.15,bh*(.22+row*.14));
        ctx.fillRect(q.x,q.y,winW,winH);
      }
    }
  }
  function shade(hex,amount){const n=parseInt(hex.slice(1),16);return '#'+[16,8,0].map(s=>Math.max(0,Math.min(255,((n>>s)&255)+amount)).toString(16).padStart(2,'0')).join('');}
  function world(state) {
    const camera={x:state.player.x,y:state.player.y,heading:state.player.heading,back:100,height:112};
    const camX=(lateral,forward,z=0)=>{const c=Math.cos(camera.heading),s=Math.sin(camera.heading);return {x:camera.x+lateral*c+forward*s,y:camera.y-lateral*s+forward*c,z};};
    const cp=(lateral,forward,z=0)=>{const q=camX(lateral,forward,z);return p(q.x,q.y,q.z,camera);};
    const horizon=h*.39;
    const sky=ctx.createLinearGradient(0,0,0,horizon); sky.addColorStop(0,'#65b8ce');sky.addColorStop(1,'#f5c58d');ctx.fillStyle=sky;ctx.fillRect(0,0,w,horizon);
    ctx.fillStyle='#f2b46c';ctx.beginPath();ctx.arc(w*.78,h*.22,Math.min(w,h)*.065,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#718d89';ctx.beginPath();ctx.moveTo(0,horizon);for(let i=0;i<8;i++)ctx.lineTo(i*w/7,horizon-18-Math.sin(i*2)*15);ctx.lineTo(w,horizon);ctx.fill();
    ctx.fillStyle=COLORS.ocean;ctx.fillRect(0,horizon,w,h-horizon);
    // Projected road surface and converging lane marks.
    const leftNear=cp(-150,130), rightNear=cp(150,130);
    polygon([leftNear,rightNear,cp(170,1150),cp(-170,1150)],'#303b40');
    line(cp(-165,130),cp(-170,1150),'#e4bd79',2);line(cp(165,130),cp(170,1150),'#e4bd79',2);
    for(let d=180;d<1100;d+=150){const a=cp(-4,d),b=cp(4,d+60);line(a,b,'#e9d7a8',Math.max(1,a.scale*3));}
    // City blocks: staggered on both sides, with depth-sorted visible faces.
    for(let d=1200;d>=120;d-=115) for(const side of [-1,1]) {
      const x=side*(205+((Math.floor(d/115)%3)*28)); const seed=Math.floor(d/115)+(side>0?2:0);
      const bw=70+(seed*17%42), bd=78+(seed*23%48), bh=80+(seed*53%270);
      drawBox(x,d,bw,bd,bh,camera,palette[Math.abs(seed*7)%palette.length],cp);
    }
    // Decorative palms along the waterfront edge.
    for(let d=210;d<1050;d+=185){const q=cp(-235,d,0),size=q.scale;ctx.strokeStyle='#644b35';ctx.lineWidth=Math.max(1,size*4);ctx.beginPath();ctx.moveTo(q.x,q.y);ctx.lineTo(q.x,q.y-size*42);ctx.stroke();for(let a=-1;a<=1;a++){line({x:q.x,y:q.y-size*38},{x:q.x+a*size*20,y:q.y-size*49},'#3f795e',Math.max(1,size*4));}}
    // Cars are projected in the same camera plane.
    for(const car of state.cars??[]) {const q=cp(car.x,car.y,2);if(q.depth<20||q.depth>1100)continue;const rw=clampSize(q.scale*18,4,28),rh=rw*.58;ctx.fillStyle=car.color;ctx.fillRect(q.x-rw/2,q.y-rh/2,rw,rh);ctx.fillStyle='#b8d3d5';ctx.fillRect(q.x-rw*.25,q.y-rh*.38,rw*.5,rh*.28);}
    // Player car anchors the lower center of the camera view.
    const px=w*.5, py=h*.78, cw=Math.min(w,h)*.09;ctx.fillStyle='#101b1f';ctx.beginPath();ctx.ellipse(px,py+cw*.25,cw*.72,cw*.36,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=state.player.inVehicle?'#f4a544':'#46d5bd';ctx.beginPath();ctx.moveTo(px,py-cw*.55);ctx.lineTo(px+cw*.62,py+cw*.3);ctx.lineTo(px-cw*.62,py+cw*.3);ctx.closePath();ctx.fill();
    return camera;
  }
  function yCoord(camera,d){return camera.y+d;}
  function clampSize(v,a,b){return Math.max(a,Math.min(b,v));}
  function overlay(state,screen) {
    ctx.fillStyle='rgba(10,27,32,.72)';ctx.fillRect(22,20,240,96);ctx.fillStyle='#f6f2e7';ctx.font='700 13px system-ui';ctx.fillText('SAN TELMO  /  PACIFIC COAST',38,45);ctx.font='600 21px system-ui';ctx.fillText(`$ ${state.cash.toLocaleString()}`,38,77);ctx.font='12px system-ui';ctx.fillStyle='#b9d5d4';ctx.fillText(`${state.district}   •   ${state.speed} MPH`,38,99);
    // Compact live minimap.
    const mx=w-154,my=24,sz=128;ctx.fillStyle='rgba(12,28,33,.8)';ctx.fillRect(mx,my,sz,sz);ctx.strokeStyle='rgba(255,255,255,.12)';for(let i=1;i<4;i++){ctx.beginPath();ctx.moveTo(mx+i*sz/4,my);ctx.lineTo(mx+i*sz/4,my+sz);ctx.moveTo(mx,my+i*sz/4);ctx.lineTo(mx+sz,my+i*sz/4);ctx.stroke();}ctx.fillStyle='#edb56c';ctx.beginPath();ctx.arc(mx+sz*.5,my+sz*.54,4,0,7);ctx.fill();ctx.fillStyle='#86c6c0';ctx.font='700 10px system-ui';ctx.fillText('N',mx+sz-15,my+15);
    ctx.fillStyle='rgba(10,27,32,.72)';ctx.fillRect(22,h-58,Math.min(w-44,590),38);ctx.fillStyle='#e8eee7';ctx.font='12px system-ui';ctx.fillText('WASD / ARROWS DRIVE     SPACE ENTER / EXIT     E INTERACT     P PAUSE',36,h-34);
    if(screen!==SCREEN_PLAY){ctx.fillStyle='rgba(5,15,18,.48)';ctx.fillRect(0,0,w,h);const title=screen===SCREEN_TITLE?'COASTLINE, OPEN ROAD':screen===SCREEN_PAUSED?'PAUSED':'CITY LIMITS';ctx.textAlign='center';ctx.fillStyle='#fff4da';ctx.font=`900 ${Math.min(56,w*.075)}px system-ui`;ctx.fillText(title,w/2,h*.43);ctx.font='500 16px system-ui';ctx.fillStyle='#e3d9c4';ctx.fillText(screen===SCREEN_TITLE?'A free-roam drive through San Telmo   ·   Press Enter to begin':screen===SCREEN_PAUSED?'Press P to continue':'Press Enter to drive again',w/2,h*.43+36);ctx.textAlign='left';}
  }
  return { draw(state,screen){ctx.clearRect(0,0,w,h);world(state);overlay(state,screen);} };
}
