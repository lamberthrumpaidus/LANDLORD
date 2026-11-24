// Create by LamberthRumpaidus
function doFire(){
 if(game.state!=='playing'||player.fireCooldown>0||!skillUnlocked('fire'))return false;
 if(player.mp<14){showToast(language==='id'?'ENERGI API BELUM CUKUP':'NOT ENOUGH FIRE ENERGY',.8);return false;}
 player.fireCooldown=.26;player.fireCast=.39;player.mp-=14;
 fireLockWindow=FIRE_CAMERA_LOCK_SECONDS;
 const target=selectAutoAimTarget();
 if(target)updateFireLockState(0);
 const forward=fireForward();player.angle=orbit;
 const mx=player.x+forward[0]*1.1,my=player.y+1.85,mz=player.z+forward[2]*1.1;
 const direction=target?norm(sub(fireTargetPoint(target),[mx,my,mz])):forward;
 player.fireAimYaw=Math.atan2(direction[0],direction[2]);
 const speed=game.flying?145:92,dist=target?Math.hypot(...sub(fireTargetPoint(target),[mx,my,mz])):0;
 attacks.push({x:mx,y:my,z:mz,vx:direction[0]*speed,vy:direction[1]*speed,vz:direction[2]*speed,
  speed,life:target?Math.max(4,dist/speed+10):2.1,kind:'fire',size:game.flying?.8:.6,phase:0,
  aimTarget:target,homingMagic:!!target,hitCooldown:0});
 burst(mx,my,mz,[1,.52,.15],30,.43);burst(mx,my,mz,[1,.91,.37],18,.22);
 player.cameraKick=.25;shake=Math.max(shake,.035);pulseSfx(330,.19,'sawtooth',.045);ldx.armFire();return true;
}
function doPulse(){if(game.state!=='playing'||player.pulseCooldown>0||player.mp<28)return;if(!skillUnlocked('pulse'))return;player.pulseCooldown=.45;player.mp-=28;ldx.armPulse();for(let e of enemies)if(!e.dead&&distance(player,e)<13){damageEnemy(e,33);e.stagger=.9}
 for(let b of wildlife)if(!b.dead&&b.kind!=='bat'&&distance(player,b)<13){b.hp-=45;b.hit=.4;if(b.hp<=0){b.dead=true;game.essence+=18;burst(b.x,b.y+1,b.z,[.8,.22,.4],18,.32)}}burst(player.x,player.y+1,player.z,[.8,.6,1],70,2);shake=.28;pulseSfx(95,.42,'sawtooth',.05)}
let altarHold=0,altarZone=-1;
function activateSeal(z){if(game.seals[z])return;game.seals[z]=true;altarHold=0;altarZone=-1;
 game.checkpoint=shrinePoint(z).z;game.checkpointX=shrinePoint(z).x;
 burst(shrinePoint(z).x,height(shrinePoint(z).x,shrinePoint(z).z)+4,shrinePoint(z).z,regions[z].accent,95,2);
 pulseSfx(760,.5,'sine',.07);showToast('✦ CHECKPOINT',1.1);refreshSkills();save();
}
// Interaction button now only collects relics. All seals auto-charge in the magic circle.
function interact(){if(game.state!=='playing')return;let z=game.zone;const rx=relicPos(z),rd=Math.hypot(player.x-rx[0],player.z-rx[1]);
 if(rd<5&&!game.relics[z]){game.relics[z]=true;game.essence+=85;player.hp=Math.min(player.maxHp,player.hp+36);player.mp=100;burst(rx[0],height(rx[0],rx[1])+1,rx[1],regions[z].accent,95,1.6);showToast(T('relic'),1.65);save();}}

function takeHit(hp,src){if(src&&ldx.tryParry(src))return;if(player.invuln>0){if(player.dashTime>0&&dodgeRewardTimer<=0){
  dodgeRewardTimer=1.15;player.counterReady=2.8;gameplayStats.perfectDodges++;
  player.mp=Math.min(100,player.mp+18);burst(player.x,player.y+1.2,player.z,[.48,1,.85],23,.65);
  showToast(language==='id'?'DODGE SEMPURNA':'PERFECT DODGE',.65);}
  return;}player.hp=Math.max(0,player.hp-hp);window.dispatchEvent(new CustomEvent('landlord:impact',{detail:{kind:'hurt',x:src?.x??player.x,y:(src?.y??player.y)+1.5,z:src?.z??player.z,boss:!!src?.boss}}));player.invuln=.85;ui.damage.style.opacity=.6;setTimeout(()=>ui.damage.style.opacity=0,180);shake=.26;pulseSfx(90,.26,'sawtooth',.05);if(player.hp<=0){player.x=game.checkpointX;player.z=game.checkpoint;player.y=height(player.x,player.z);player.vy=0;player.vx=player.vz=0;game.flying=false;player.grounded=true;player.hp=player.maxHp;player.mp=100;player.invuln=3;cameraReady=false;refreshSkills();showToast('✦ CHECKPOINT',1.1);save()}}
let shake=0,impactDirection=[0,0];
function update(dt){
 updateFireLockState(dt);
 if(game.state==='playing'&&!game.relics[game.zone]){let r=relicPos(game.zone);if(Math.hypot(player.x-r[0],player.z-r[1])<4.5)interact();}clock+=dt;game.time+=dt;game.played+=dt;animatedTime+=dt;ldx.update(dt);
 player.invuln=Math.max(0,player.invuln-dt);
 player.coyote=player.grounded?.11:Math.max(0,player.coyote-dt);
 player.jumpBuffer=Math.max(0,player.jumpBuffer-dt);
 player.counterReady=Math.max(0,player.counterReady-dt);
 for(const p of damagePopups){p.t+=dt;p.life-=dt;}
 damagePopups=damagePopups.filter(p=>p.life>0);
 // Localized hit-stop: only sword pose time is affected; movement, inputs and world physics continue.
 const stopped=player.dashTime>0?0:Math.min(dt,player.hitPause);
 const animDT=dt-stopped;
 player.hitPause=Math.max(0,player.hitPause-dt);
 player.cameraKick=Math.max(0,player.cameraKick-dt*1.9);
 const hadAttack=player.attackTime>0;
 if(hadAttack){
   player.attackTime=Math.max(0,player.attackTime-animDT);
   player.attackClock=player.attackDuration-player.attackTime;
   if(player.attackHitReady&&player.attackClock/player.attackDuration>=COMBOS[player.combo].hit){player.attackHitReady=false;resolveMelee();}
   if(player.attackTime<=.065&&player.attackQueued&&player.attackBuffer>0){startAttack((player.combo+1)%3);}
 }
 player.attackBuffer=Math.max(0,(player.attackBuffer||0)-dt);
 if(!player.attackTime)$('comboTag').classList.remove('show');
 if(!player.attackTime)player.comboTime=Math.max(0,player.comboTime-dt);
 player.swordTrail=player.swordTrail.filter(s=>(s.life-=dt)>0);
 hitFlashes=hitFlashes.filter(h=>(h.life-=dt)>0);
 $('combatFlash').style.opacity=Math.min(.68,player.cameraKick*1.4).toFixed(3);
 player.attackCooldown=Math.max(0,player.attackCooldown-dt);player.fireCooldown=Math.max(0,player.fireCooldown-dt);player.fireCast=Math.max(0,player.fireCast-dt);player.dashCooldown=Math.max(0,player.dashCooldown-dt);player.pulseCooldown=Math.max(0,player.pulseCooldown-dt);player.dashTime=Math.max(0,player.dashTime-dt);shake=Math.max(0,shake-dt);
 let previousZ=player.z,previousX=player.x,previousZone=zoneOf(previousZ);
 const input=getInput(),dir=cameraMove(input);
 const running=input.walking&&input.z>.25&&Math.abs(input.x)<.8;
 const combatPose=sampleAttackPose(player);
 const baseSpeed=(game.flying?40:(running?14.2:10.6))*(player.attackTime>0?(player.combo===2?.62:.79):1);
 const movementSpeed=player.dashTime>0?(game.flying?96:60):baseSpeed;
 // Acceleration + braking, with extra traction in the air. No instant strafing or sliding.
 const traction=1-Math.exp(-dt*(game.flying?19:player.grounded?(input.walking?22:25):11));
 const vtx=player.dashTime>0?player.dashVX*movementSpeed:dir.x*movementSpeed;
 const vtz=player.dashTime>0?player.dashVZ*movementSpeed:dir.z*movementSpeed;
 player.vx=mix(player.vx,vtx,player.dashTime>0?1:traction);
 player.vz=mix(player.vz,vtz,player.dashTime>0?1:traction);
 if(Math.abs(player.vx)+Math.abs(player.vz)<.025){player.vx=0;player.vz=0}
 player.x+=player.vx*dt;player.z+=player.vz*dt;
 // Weapon follow-through pulls the hips forward without teleporting the hero.
 if(player.attackTime>0&&combatPose.active>.30&&player.grounded){
    if(Math.random()<.22&&player.swordTip){let v=player.swordTip;burst(v[0],v[1],v[2],COMBOS[player.combo].color,2,.10);}
    let impulse=(player.combo===2?3.2:1.3)*combatPose.active*dt;
    player.x+=Math.sin(player.angle)*impulse;player.z+=Math.cos(player.angle)*impulse;
 }
 const actualSpeed=Math.hypot(player.vx,player.vz),vFraction=clamp(actualSpeed/(game.flying?40:14.2),0,1.2);
 player.motion=mix(player.motion,vFraction,Math.min(1,dt*9));
 player.gait+=dt*actualSpeed*.79;
 player.move=player.gait;
 // Free camera: face the current run direction. Right-click aim: face the crosshair and strafe/backpedal.
 const desiredAngle=mouseOrbit?orbit:(actualSpeed>.6?Math.atan2(player.vx,player.vz):player.angle);
 const turn=shortestTurn(player.angle,desiredAngle);
 player.angle+=turn*(1-Math.exp(-dt*(player.dashTime>0?27:18)));
 player.lean=mix(player.lean,clamp(turn*3.3,-.34,.34)*player.motion,Math.min(1,dt*8));
 if(player.dashTime>0&&Math.random()<.40){const col=game.flying?[.39,.90,1]:regions[game.zone].accent;burst(player.x-player.dashVX*.75,player.y+1.2,player.z-player.dashVZ*.75,col,game.flying?3:2,.17);}
 if(player.grounded&&!game.flying&&actualSpeed>4&&Math.floor(player.gait/Math.PI)!==Math.floor((player.gait-actualSpeed*.79*dt)/Math.PI)){
   let fx=player.x+Math.sin(player.angle+.5)*.34,fz=player.z+Math.cos(player.angle+.5)*.3;
   burst(fx,height(fx,fz)+.13,fz,tint(regions[game.zone].ground,1.4),quality==='low'?2:5,.12);
 }
 // Sweep movement with substeps and axis sliding. Obstacles are registered from static props,
 // so rocks, crystalline spikes, trees, columns and gateposts now physically block the hero.
 let wantX=player.x-previousX,wantZ=player.z-previousZ;
 player.x=previousX;player.z=previousZ;
 // Dash impacts can shatter crates while permanent architecture stays solid.
 if(player.dashTime>0&&Math.abs(player.y-height(player.x,player.z))<4)damageNearbyBreakables(player.x,player.z,2.3,90);
 // Flying and dashing do NOT disable structural collision.
 moveWithCollision(player,wantX,wantZ,.72,player.y,2.65);
 player.x=clamp(player.x,-79,79);player.z=clamp(player.z,3,END-6);
 const gate=portalPoint(previousZone),crossed=previousZone<6&&previousZ<gate.z&&player.z>=gate.z;
 if(crossed&&!game.flying){
  const clearance=player.y-height(gate.x,gate.z);
  if(Math.abs(player.x-gate.x)<9&&clearance<9.3){
   const destination=previousZone+1;portalFlash();player.z=destination*LEN+10;player.x=roadCenter(player.z);
   player.vx=player.vz=0;player.invuln=2;burst(player.x,height(player.x,player.z)+3,player.z,regions[destination].accent,38,1.3);
  }else{player.z=gate.z-2.2;if(warnTimer<=0){showToast(language==='id'?'CARI GERBANG':'FIND GATE',1.1);warnTimer=3;}}
 }
 warnTimer=Math.max(0,warnTimer-dt);
 sidePortalCooldown=Math.max(0,sidePortalCooldown-dt);
 if(!game.flying&&sidePortalCooldown<=0){const side=sidePortalPoint(previousZone),sep=Math.hypot(player.x-side.x,player.z-side.z);
  if(sep<3.4){
   sidePortalHold+=dt;
   if(sidePortalHold>=1.15){portalFlash();const destination=side.destination;
     player.z=destination*LEN+13;player.x=roadCenter(player.z);
     player.vx=player.vz=0;sidePortalHold=0;sidePortalCooldown=2;player.invuln=2;
     showToast('✦ PORTAL '+String(destination+1).padStart(2,'0'),1.4);save();}
  }else sidePortalHold=0;
 }
 const ground=height(player.x,player.z),wasGrounded=player.grounded;
 if(game.flying){
  let lift=keySet.has(keybinds.jump)?24:0,drop=keySet.has(keybinds.descend)?24:0;
  if(typeof flightTouchRise!=='undefined'&&flightTouchRise)lift=24;
  if(typeof flightTouchDrop!=='undefined'&&flightTouchDrop)drop=24;
  const launch=player.flightLaunch>0;
  if(launch){player.flightLaunch=Math.max(0,player.flightLaunch-dt);lift=Math.max(lift,20);if(Math.random()<.7)burst(player.x,player.y-.6,player.z,[.35,.92,1],2,.16);}
  player.y=clamp(player.y+(lift-drop+(player.dashTime>0?player.dashVY:0))*dt,ground+(launch?2.6:8),ground+70);player.vy=0;player.grounded=false;
 }else{player.vy-=24*dt;player.y+=player.vy*dt;if(player.y<=ground){player.y=ground;player.vy=0;player.grounded=true;if(!wasGrounded){player.landPulse=.42;shake=Math.max(shake,.09);burst(player.x,ground+.12,player.z,regions[game.zone].ground,11,.23);}
   if(player.jumpBuffer>0){player.jumpBuffer=0;player.coyote=0;player.vy=10.4;player.grounded=false;gameplayStats.bufferedJumps++;}}
 else player.grounded=false;}
 player.landPulse=Math.max(0,(player.landPulse||0)-dt);
 if(checkVictory())return;
 player.mp=Math.min(100,player.mp+18*dt);
 for(let e of enemies){
   if(e.dead||Math.abs(e.z-player.z)>92)continue;
   e.attack=Math.max(0,e.attack-dt);e.hit=Math.max(0,e.hit-dt);e.stagger=Math.max(0,e.stagger-dt);e.hitRecoil=Math.max(0,(e.hitRecoil||0)-dt);
   if(Math.abs(e.knockVX||0)+Math.abs(e.knockVZ||0)>.01){
      const dec=Math.exp(-dt*9.2);moveWithCollision(e,(e.knockVX||0)*dt,(e.knockVZ||0)*dt,e.radius*.64);e.knockVX*=dec;e.knockVZ*=dec;
   }
   e.projectileCD=Math.max(0,e.projectileCD-dt);
   let dd=distance(e,player),active=(ldx.perceive(e,dd,dt)&&(!game.flying||player.y-e.y<(e.boss?9:4)||e.mem>0))||e.windup>0;
   if(active){
      e.angle=(e.seen||e.windup>0)?Math.atan2(player.x-e.x,player.z-e.z):Math.atan2(e.lkx-e.x,e.lkz-e.z);
      if(e.windup>0){
        e.windup-=dt;
        if(e.windup<=0){
          const reach=e.boss?5.4:3.4;
          if(dd<reach&&Math.abs(shortestTurn(e.angle,Math.atan2(player.x-e.x,player.z-e.z)))<1.25)
            takeHit(e.boss?19:7+e.zone*2,e);
          burst(e.x,e.y+1.1,e.z,regions[e.zone].accent,e.boss?25:9,.42);
          shake=Math.max(shake,.09);
        }
      }else if(e.stagger<=0){
        if(dd>e.radius+2){
          let sp=e.speed*(e.boss?1.02:1);
          const retreat=!e.boss&&e.hp<e.maxHp*.27&&e.seen&&dd<14;
          const gx=retreat?clamp(e.x+(e.x-player.x)*1.5,-74,74):(e.seen?player.x:e.lkx);
          const gz=retreat?clamp(e.z+(e.z-player.z)*1.5,4,END-5):(e.seen?player.z:e.lkz);
          let flankX=0,flankZ=0,repelX=0,repelZ=0;
          if(e.seen&&!retreat&&dd<16){
            const lateral=e.boss?0:(Math.sin(e.phase*2.3)>=0?1:-1);
            const sideForce=clamp((dd-2.3)/12,0,1)*2.7;
            flankX=-Math.cos(e.angle)*lateral*sideForce;
            flankZ=Math.sin(e.angle)*lateral*sideForce;
          }
          // Local separation is restricted to the player's active realm, not all 7 worlds.
          for(const other of enemies){
            if(other===e||other.dead||other.zone!==e.zone)continue;
            const dx=e.x-other.x,dz=e.z-other.z,d2=dx*dx+dz*dz;
            if(d2<12.25&&d2>.002){const w=(3.5-Math.sqrt(d2))/d2;repelX+=dx*w;repelZ+=dz*w;}
          }
          const heading=steerAround(e,gx+flankX+repelX*2.2,gz+flankZ+repelZ*2.2,retreat?sp*1.28:sp,dt,e.radius*.60);
          if(heading!==null)e.angle+=shortestTurn(e.angle,heading)*Math.min(1,dt*4);
          e.animation+=dt*sp*1.9;
        } else if(e.attack<=0){e.windup=e.boss?(e.p2?.78:.96):.57;window.dispatchEvent(new CustomEvent('landlord:impact',{detail:{kind:'enemy',x:e.x,y:e.y+1.5,z:e.z,boss:!!e.boss}}));e.attack=e.boss?(e.p2?1.5:2.3):1.75;}
      }
      // Ranged bosses wind up recognizable projectiles instead of random instantaneous hits.
      if(e.boss&&e.zone>=3&&dd>7&&dd<23&&e.projectileCD<=0&&e.windup<=0){
        const lead=.34+Math.min(.5,dd/40),tx=player.x+player.vx*lead,tz=player.z+player.vz*lead;
        let a=Math.atan2(tx-e.x,tz-e.z);
        const spread=e.p2?[-.22,0,.22]:[0];
        for(const offset of spread){const ang=a+offset;
          attacks.push({x:e.x,y:e.y+2,z:e.z,vx:Math.sin(ang)*(e.p2?16:13),vz:Math.cos(ang)*(e.p2?16:13),life:2.5,kind:'enemy',size:e.p2?.53:.5});}
        e.projectileCD=2.8+hash(clock*3)*1.7;
        burst(e.x,e.y+2,e.z,regions[e.zone].accent,14,.5);
      }
   }else{let wobble=Math.sin(clock*.25+e.phase)*dt*.1;moveWithCollision(e,wobble,Math.cos(clock*.28+e.phase)*dt*.1,e.radius*.60)}
   e.y=height(e.x,e.z);
 }
 // Haunted wildlife: cursed wolves and crawlers stalk the road, bats wheel overhead.
 for(const beast of wildlife){if(beast.dead||Math.abs(beast.z-player.z)>72)continue;
  if(beast.kind==='bat'){
    beast.x=beast.homeX+Math.sin(clock*.82+beast.phase)*6;
    beast.z=beast.homeZ+Math.cos(clock*.69+beast.phase)*5;
    beast.y=height(beast.x,beast.z)+5.8+Math.sin(clock*1.9+beast.phase)*1.5;
    beast.angle=Math.atan2(Math.cos(clock*.82+beast.phase),-Math.sin(clock*.69+beast.phase));continue;
  }
  beast.hit=Math.max(0,beast.hit-dt);beast.cooldown=Math.max(0,beast.cooldown-dt);
  beast.attackAnim=Math.max(0,beast.attackAnim-dt);
  let dd=Math.hypot(player.x-beast.x,player.z-beast.z);
  const aggressive=dd<21*ldx.hunt(beast)&&(!game.flying||player.y-height(beast.x,beast.z)<4);
  let toward=aggressive?Math.atan2(player.x-beast.x,player.z-beast.z):Math.atan2(beast.homeX-beast.x+Math.sin(clock*.4+beast.phase)*7,beast.homeZ-beast.z+Math.cos(clock*.35+beast.phase)*7);
  beast.angle+=shortestTurn(beast.angle,toward)*Math.min(1,dt*3.4);
  let sp=aggressive?(beast.kind==='wolf'?4.8*ldx.hunt(beast):3.4):1.25;
  if(dd>2.2){
    const gx=aggressive?player.x:beast.homeX+Math.sin(clock*.4+beast.phase)*7;
    const gz=aggressive?player.z:beast.homeZ+Math.cos(clock*.35+beast.phase)*7;
    const heading=steerAround(beast,gx,gz,sp,dt,beast.kind==='wolf'?.78:1.05);
    if(heading!==null)beast.angle+=shortestTurn(beast.angle,heading)*Math.min(1,dt*5);
  }
  else if(aggressive&&beast.cooldown<=0){beast.cooldown=1.85;beast.attackAnim=.52;
    takeHit(beast.kind==='wolf'?9:13);shake=Math.max(shake,.14);
    burst(beast.x,height(beast.x,beast.z)+.8,beast.z,[.77,.15,.29],10,.22);
  }
  beast.y=height(beast.x,beast.z);
 }
 for(const a of attacks){
   a.life-=dt;
   if(a.kind==='fire'&&a.homingMagic&&a.aimTarget&&!a.aimTarget.dead&&a.aimTarget.hp>0){
     // Accurate 3D homing, including moving and flying monsters.
     // Locked magic shots phase around physical debris; ordinary shots still collide with solids.
     const pt=fireTargetPoint(a.aimTarget),offset=sub(pt,[a.x,a.y,a.z]),distanceLeft=Math.hypot(...offset);
     const speed=a.speed||92,step=Math.min(distanceLeft,speed*dt);
     const direction=distanceLeft>1e-5?scale(offset,1/distanceLeft):[0,0,0];
     a.vx=direction[0]*speed;a.vy=direction[1]*speed;a.vz=direction[2]*speed;
     if(distanceLeft>1.0){a.x+=direction[0]*step;a.y+=direction[1]*step;a.z+=direction[2]*step;}
     a.hitCooldown=Math.max(0,(a.hitCooldown||0)-dt);
     if(distanceLeft<=Math.max(1.0,speed*dt+1)){
       a.x=pt[0];a.y=pt[1];a.z=pt[2];
       if(a.hitCooldown<=0){applyHomingDamage(a.aimTarget);a.hitCooldown=.09;}
     }
     a.phase=(a.phase||0)+dt*14;
     if(a.aimTarget.dead||a.aimTarget.hp<=0){a.life=0;
       burst(a.x,a.y,a.z,[1,.48,.2],18,.55);
     }
     if(a.life>0&&Math.random()<.65)burst(a.x,a.y,a.z,[1,.52,.19],2,.15);
     continue;
   }
   // Non-homing fire and enemy shots preserve swept collision with permanent structures.
   const travel=Math.hypot(a.vx,a.vy||0,a.vz)*dt,steps=Math.max(1,Math.ceil(travel/.45));
   let hitWall=false;
   for(let k=0;k<steps;k++){
     a.x+=a.vx*dt/steps;a.z+=a.vz*dt/steps;a.y+=(a.vy||0)*dt/steps;
     const wall=blocking(a.x,a.z,.13,a.y-.12,.30);
     if(wall||a.y<height(a.x,a.z)+.04){
       if(wall&&wall.breakableId!==undefined&&a.kind==='fire')strikeBreakableById(wall.breakableId,63);
       hitWall=true;break;
     }
   }
   a.phase=(a.phase||0)+dt*14;
   if(hitWall){a.life=0;burst(a.x,a.y,a.z,a.kind==='fire'?[1,.42,.20]:[.65,.32,.75],10,.2);continue;}
   if(a.kind==='fire'){
     for(const b of wildlife)if(!b.dead&&Number.isFinite(b.hp)&&Math.hypot(b.x-a.x,b.z-a.z)<1.6&&Math.abs(fireTargetPoint(b)[1]-a.y)<2.0){applyHomingDamage(b);a.life=0;break;}
     for(const e of enemies)if(a.life>0&&!e.dead&&Math.hypot(e.x-a.x,e.z-a.z)<(e.boss?3.9:1.7)&&Math.abs(e.y+1.6-a.y)<(e.boss?4.5:2.4)){
       damageEnemy(e,46);a.life=0;break;
     }
   }else if(a.kind==='enemy'&&Math.hypot(player.x-a.x,player.z-a.z)<1.8&&Math.abs(player.y+1-a.y)<2.4){takeHit(17);a.life=0;}
   if(a.life>0&&Math.random()<.62)burst(a.x,a.y,a.z,a.kind==='fire'?[1,.45,.2]:[.78,.23,.68],2,.15);
 }attacks=attacks.filter(a=>a.life>0);
 for(const d of debris){d.life-=dt;d.x+=d.vx*dt;d.z+=d.vz*dt;d.y+=d.vy*dt;d.vy-=15*dt;d.vx*=Math.exp(-dt*2.5);d.vz*=Math.exp(-dt*2.5);d.y=Math.max(d.y,height(d.x,d.z)+.08);d.rot+=dt*5;}debris=debris.filter(d=>d.life>0);
 for(const p of particles){p.life-=dt;p.x+=p.vx*dt;p.z+=p.vz*dt;p.y+=p.vy*dt;p.vy-=7*dt}particles=particles.filter(p=>p.life>0);
 for(const p of pickups){p.life-=dt;let d=Math.hypot(p.x-player.x,p.z-player.z);if(d<3.5){p.life=0;game.essence+=p.value;player.hp=Math.min(player.maxHp,player.hp+.6);}else if(d<14){const pull=Math.min(1,dt*(3+Math.max(0,14-d)*.48));p.x+=(player.x-p.x)*pull;p.z+=(player.z-p.z)*pull}}
 pickups=pickups.filter(p=>p.life>0);
 let desiredHp=100+(powerLevel()-1)*14;if(desiredHp>player.maxHp){player.hp+=desiredHp-player.maxHp;player.maxHp=desiredHp;showToast('✦ '+T('level')+' '+powerLevel(),1.8);save()}
 game.autosave+=dt;if(game.autosave>18){game.autosave=0;save()}
 markExplored();
 updateDiscoveries(dt);
 // Timer only advances when standing nearly still on the magical ring, not beside it.
 nearShrine=-1;
 const sealZone=zoneOf(player.z),ring=shrinePoint(sealZone);
 const ringDistance=Math.hypot(player.x-ring.x,player.z-ring.z);
 if(!game.seals[sealZone]&&ringDistance<=4.75){
   nearShrine=sealZone;
   if(altarZone!==sealZone){altarZone=sealZone;altarHold=0;}
   if(!game.flying&&player.grounded&&Math.hypot(player.vx,player.vz)<1.1&&player.dashTime<=0){
      altarHold=Math.min(2,altarHold+dt);
      if(altarHold>=2){activateSeal(sealZone);nearShrine=-1;}
   }else{altarHold=Math.max(0,altarHold-dt*1.4);}
 }else{altarZone=-1;altarHold=0;}

 if(toaster>0){toaster-=dt;if(toaster<=0)ui.toast.classList.remove('show')}
 if(splashTime>0){splashTime-=dt;if(splashTime<=0)ui.splash.classList.remove('visible')}
 zoneChanged();updateUI();refreshSkills();
}
function markExplored(){const j=zoneOf(player.z),cells=game.explored[j];game.visited[j]=true;
 const x=Math.round(player.x/11)*11,z=Math.round(player.z/11)*11;
 if(!cells.some(p=>p[0]===x&&p[1]===z)){cells.push([x,z]);if(cells.length>320)cells.shift();}
}
function travelRealm(index){if(!game.flying||game.state!=='map'||index<0||index>6)return;portalFlash();
 player.z=index*LEN+15;player.x=roadCenter(player.z);sidePortalCooldown=2;sidePortalHold=0;player.y=height(player.x,player.z)+16;player.vx=player.vz=player.vy=0;cameraReady=false;
 game.visited[index]=true;markExplored();game.prevZone=-1;game.state='playing';ui.map.classList.remove('visible');
 if(isTouchDevice())revealTouchControls();zoneChanged(true);refreshSkills();lastFrame=0;save();}
let warnTimer=0,sidePortalHold=0,sidePortalCooldown=0;
function powerLevel(){return 1+Math.min(5,Math.floor(game.essence/190))}
// Skinned-style procedural limbs: every knee, heel, shoulder and sword joint is animated in 3D.
function limb(m,a,b,ra,rb,col,emit=0,sides=7){
 let axis=norm(sub(b,a)),ref=Math.abs(axis[1])>.92?[0,0,1]:[0,1,0],right=norm(cross(axis,ref)),up=norm(cross(right,axis));
 for(let i=0;i<sides;i++){let t=i*TAU/sides,u=(i+1)*TAU/sides;
   const point=(ctr,r,k)=>add(ctr,add(scale(right,Math.cos(k)*r),scale(up,Math.sin(k)*r)));
   const n=k=>norm(add(scale(right,Math.cos(k)),scale(up,Math.sin(k))));
   m.smoothQuad([point(a,ra,u),point(a,ra,t),point(b,rb,t),point(b,rb,u)],[n(u),n(t),n(t),n(u)],col,emit);
 }
}
// LANDLORD VI / BLADE DANCE — full-body pose blending with articulated arms, sword and cloth.
function bladeSteel(m,base,tip,steel,glow){
 const v=norm(sub(tip,base)),t=Math.abs(v[1])>.93?[0,0,1]:[0,1,0],u=norm(cross(v,t)),w=norm(cross(v,u));
 const guardBase=add(base,scale(v,.13)),point=add(base,scale(v,2.27));
 const radius=.23;
 for(let i=0;i<4;i++){
    const a=i*TAU/4,b=(i+1)*TAU/4;
    const at=(p,r,angle)=>add(p,add(scale(u,Math.cos(angle)*r),scale(w,Math.sin(angle)*r)));
    m.quad(at(guardBase,radius,a),at(guardBase,radius,b),at(point,.13,b),at(point,.13,a),tint(steel,.81+.19*Math.cos(a)));
    m.tri(at(point,.13,a),at(point,.13,b),tip,glow,.21);
 }
 limb(m,add(base,scale(v,.15)),add(tip,scale(v,-.19)),.025,.012,glow,.77,5);
}
function playerModel(m){
 const p=player,steel=[.24,.32,.39],polish=[.40,.49,.55],iron=[.075,.105,.145],gold=[.56,.39,.18],leather=[.10,.07,.08],royal=[.20,.045,.065],magic=[.28,.78,.90];
 const pose=sampleAttackPose(p),activity=clamp(p.motion,0,1.1),phase=p.gait,airborne=!p.grounded,dash=p.dashTime>0,attack=p.attackTime>0;
 const attackBlend=attack?Math.min(1,Math.sin(Math.PI*pose.progress)*1.65):0;
 const bob=p.grounded?Math.sin(phase*2)*.047*activity*(1-attackBlend*.65):0;
 const landing=Math.sin(Math.PI*clamp((p.landPulse||0)/.42,0,1))*.16;
 const hips=1.12+bob-(dash?.29:0)-pose.crouch*.47-landing-(game.flying?.13:0);
 const breath=!attack&&!airborne?Math.sin(clock*2.05)*.032:0;
 const chest=2.21+bob+breath-(dash?.20:0)-pose.crouch*.39-landing*.8+(game.flying?.12:0);
 // Upper and lower body do not rotate together. Feet plant while the torso winds up.
 for(const side of [-1,1]){
    let stride=Math.sin(phase+(side===1?0:Math.PI))*activity*(1-attackBlend*.83);
    let step=stride*.67,footLift=airborne?.32:Math.max(0,stride)*.42;
    let stance=attackBlend*(side===1?-.45:.34),stanceZ=attackBlend*(side===1?-.51:.23);
    let hip=[side*.36,hips,.0],knee=[side*(.38+.09*attackBlend),.76+bob*.4,step*.43+stanceZ*.28+.13],ankle=[side*.40+stance,.18+footLift,-step+stanceZ];
    limb(m,hip,knee,.24,.18,steel,0,9);m.ellipsoid(...knee,.23,.22,.24,polish,0,5,9);
    limb(m,knee,ankle,.19,.15,tint(iron,1.13),0,9);
    // Foot follows local terrain rather than clipping on sloped ground.
    const footX=p.x+ankle[0]*Math.cos(p.angle)+ankle[2]*Math.sin(p.angle);
    const footZ=p.z-ankle[0]*Math.sin(p.angle)+ankle[2]*Math.cos(p.angle);
    const terrainOffset=clamp(height(footX,footZ)-p.y,-.34,.43);
    ankle[1]+=p.grounded?terrainOffset:0;
    m.ellipsoid(ankle[0],ankle[1]+.05,ankle[2]+.16,.30,.20,.50,iron,0,6,9);
    m.box(ankle[0],ankle[1]+.15,ankle[2]+.28,.38,.21,.32,gold);
    m.box(knee[0],knee[1],knee[2]+.15,.24,.36,.10,polish);
 }
 const oldPt=m.pt.bind(m),c=Math.cos(pose.twist),s=Math.sin(pose.twist);
 const twistLocal=(v)=>{
    let x=v[0],y=v[1]-hips,z=v[2];
    let xx=x*c+z*s,zz=-x*s+z*c;
    return [xx+(p.lean*.22)*(y+1.5),hips+y+.055*Math.sin(pose.progress*Math.PI),zz+pose.lunge*.28];
 };
 m.pt=(v)=>oldPt(twistLocal(v));
 m.ellipsoid(0,chest-.25,0,.59,.82,.43,iron,0,10,12);
 m.ellipsoid(0,chest+.15,.07,.69,.60,.43,steel,0,9,13);
 m.box(0,chest+.16,.46,.26,.85,.07,tint(gold,.86));
 m.box(0,chest+.51,.39,1.06,.12,.13,polish);
 m.box(0,chest-.40,.36,1.02,.13,.14,gold);
 m.box(0,hips-.07,.01,1.0,.27,.7,leather);
 m.box(0,hips-.08,.41,.27,.22,.14,gold,.34);
 for(let j=-2;j<=2;j++)m.box(j*.25,hips-.26,.24-Math.abs(j)*.05,.22,.48,.29,tint(steel,.78+j*.025),0,j*.08);
 // Neck, visor, head, crest; subtly pitch into each attack for weight.
 m.ellipsoid(0,chest+.75,0,.32,.29,.30,iron,0,6,9);
 m.ellipsoid(0,chest+1.06,.02,.37,.48,.36,steel,0,12,18);
 m.ellipsoid(0,chest+1.36,-.05,.28,.16,.30,polish,0,8,14);
 m.ellipsoid(0,chest+1.22,.25,.32,.21,.18,iron,0,8,14);
 m.box(0,chest+1.07,.36,.60,.10,.15,[.018,.025,.036]);
 m.box(0,chest+.96,.37,.6,.11,.17,[.06,.11,.15]);
 for(const side of [-1,1]){
   m.ellipsoid(side*.14,chest+1.08,.435,.085,.025,.024,magic,.42,4,8);
   m.box(side*.34,chest+1.14,-.02,.075,.42,.30,tint(gold,.77),0,side*.04);
 }
 m.ellipsoid(0,chest+1.53,-.13,.11,.15,.35,tint(royal,1.4),0,7,13);
 for(let i=0;i<5;i++)m.box(0,chest+.91+i*.08,-.325,.12,.027,.035,gold);
 m.box(0,chest+.65,-.01,1.28,.21,.70,tint(steel,.9));
 // Joint chain: shoulders -> elbows -> wrists, with independently posed hands.
 for(const side of [-1,1]){
   const shoulder=[side*.77,chest+.37,-.04];
   const armSwing=Math.sin(phase+(side===1?Math.PI:0))*.35*activity*(1-attackBlend);
   let hand,elbow;
   if(side===1){
     hand=[pose.hand[0],pose.hand[1]+(chest-2.21),pose.hand[2]];
     elbow=[.91+(hand[0]-.91)*.50+.12,chest+.03+(hand[1]-chest)*.41,hand[2]*.48-.14];
   } else {
     const cast=clamp((p.fireCast||0)/.39,0,1),lift=Math.sin(Math.PI*(1-cast));
     hand=[-.96+cast*.42,chest-.61+cast*1.0,.18+armSwing*.85+attackBlend*.25+lift*.6];
     elbow=[-1.10+cast*.24,chest-.14+cast*.50,armSwing*.4+attackBlend*.18+cast*.22];
   }
   if(airborne){hand[1]+=.25;elbow[1]+=.18;}if(game.flying){hand[0]+=side*.37;hand[1]+=.21;elbow[0]+=side*.25;}
   m.ellipsoid(side*.79,chest+.34,-.04,.43,.28,.46,iron,0,9,14);
   for(let plate=0;plate<3;plate++){const shift=plate*.095;m.ellipsoid(side*(.74+shift),chest+.46-plate*.135,-.055,.36-plate*.035,.12,.40-plate*.018,plate===0?polish:steel,0,7,14);}
   m.box(side*.85,chest+.50,-.33,.17,.07,.08,gold);
   limb(m,shoulder,elbow,.25,.20,steel,0,9);
   m.ellipsoid(...elbow,.23,.23,.23,gold,0,5,8);
   limb(m,elbow,hand,.21,.15,iron,0,9);
   m.ellipsoid(...hand,.20,.19,.26,polish,0,5,8);
   if(side===1){
     const direction=pose.blade,grip=add(hand,scale(direction,-.17)),bladeBase=add(hand,scale(direction,.60)),bladeTip=add(bladeBase,scale(direction,2.75));
     limb(m,grip,bladeBase,.115,.13,leather,.1,8);
     // Crossguard is perpendicular to the sword axis, so it rotates with the attack.
     let guardAxis=norm(cross(direction,Math.abs(direction[1])>.92?[0,0,1]:[0,1,0]));
     limb(m,add(bladeBase,scale(guardAxis,-.57)),add(bladeBase,scale(guardAxis,.57)),.11,.11,gold,.28,7);
     m.sphere(bladeBase[0],bladeBase[1],bladeBase[2],.18,gold,4,8,.19);
     bladeSteel(m,bladeBase,bladeTip,polish,magic);
     // Every trail sample is derived from the actual transformed weapon, never a painted static circle.
     p.swordBase=m.pt(add(bladeBase,scale(direction,.52)));
     p.swordTip=m.pt(bladeTip);
   }
 }
 // Cloth physics-like follow-through: sway, inertia and twist propagate to the hem.
 const flutter=Math.sin(clock*4.7+phase*.6)*(.08+.15*activity)+(airborne?.26:0)+(game.flying?.34:0);
 for(let strip=0;strip<11;strip++){
   let x0=-.69+strip*1.38/11,x1=-.69+(strip+1)*1.38/11;
   for(let j=0;j<7;j++){
     const a=j/7,b=(j+1)/7;
     const fx=(x,t)=>x*(1+.34*t)+p.lean*t*.55+Math.sin(pose.progress*TAU)*pose.twist*.22*t;
     const fy=t=>chest+.48-t*2.43;
     const fz=(x,t)=>-.46-t*(.18+.55*activity)-.10*Math.cos(x*15)*(.35+t)-.18*Math.sin(clock*3.1+t*4+x*2)*t-.34*flutter*t-pose.lunge*t*.39;
     m.quad([fx(x0,a),fy(a),fz(x0,a)],[fx(x1,a),fy(a),fz(x1,a)],
            [fx(x1,b),fy(b),fz(x1,b)],[fx(x0,b),fy(b),fz(x0,b)],tint(royal,(strip===0||strip===10)?.67:.83+.12*Math.cos(strip*1.9)+j*.018));
     if(strip===0||strip===10){const x=strip===0?x0:x1,dx=strip===0?.045:-.045;const p0=[fx(x,a),fy(a),fz(x,a)-.014],p1=[fx(x+dx,a),fy(a),fz(x+dx,a)-.014],p2=[fx(x+dx,b),fy(b),fz(x+dx,b)-.014],p3=[fx(x,b),fy(b),fz(x,b)-.014];m.quad(p0,p1,p2,p3,tint(gold,.78));}
   }
 }
 m.pt=oldPt;
 // Sword history is updated AFTER calculating actual world-space joint positions.
 if(p.swordTip&&p.swordBase&&attack&&pose.active>.012&&clock-p.lastSwordStamp>.012){
   const last=p.swordTrail[p.swordTrail.length-1];
   // Sub-frame interpolated samples keep the arc continuous even on slower laptops.
   if(last&&last.combo===p.combo){
     const delta=clock-p.lastSwordStamp,n=clamp(Math.ceil(delta/.014),1,5);
     for(let i=1;i<n;i++){
       const u=i/n;
       p.swordTrail.push({tip:last.tip.map((v,j)=>mix(v,p.swordTip[j],u)),base:last.base.map((v,j)=>mix(v,p.swordBase[j],u)),life:.23,max:.23,combo:p.combo});
     }
   }
   p.swordTrail.push({tip:[...p.swordTip],base:[...p.swordBase],life:.23,max:.23,combo:p.combo});
   if(p.swordTrail.length>28)p.swordTrail.shift();p.lastSwordStamp=clock;
 }
}
function enemyModel(m,e){
 const type=e.type,c=regions[e.zone],boss=e.boss,size=boss?1.75:1;
 if(boss&&window.LandlordBossModels){LandlordBossModels.draw(m,e,c,{limb,tint,clamp,clock,quality,distance:distance(player,e)});return;}
 const locomotion=e.stagger>0?.0:.32*Math.sin(e.animation),wind=e.windup>0?1-e.windup/(boss?.96:.57):0;
 if(type==='spider'&&!boss){
   let rear=Math.sin(clock*4+e.phase)*.14;
   m.sphere(0,1.1+rear,0,.84,[.15,.1,.18],4,9);m.sphere(0,1.26,.72,.57,c.flora,4,8);
   for(let s of [-1,1])for(let i=0;i<4;i++){
      const z=-.68+i*.48,step=Math.sin(e.animation+i*1.9+s)*.18;
      limb(m,[s*.6,1,z],[s*1.7,1.15+step,z+.18],.14,.11,c.flora);
      limb(m,[s*1.7,1.15+step,z+.18],[s*1.93,.16+Math.abs(step),z+.65],.11,.07,tint(c.flora,.77));
   }
   m.sphere(-.2,1.5,.98,.13,c.accent,3,6,1);m.sphere(.2,1.5,.98,.13,c.accent,3,6,1);return;
 }
 const base=boss?[.19,.15,.25]:(type==='goblin'?[.18,.35,.21]:type==='skeleton'?[.67,.64,.6]:c.stone);
 const h=boss?5.8:type==='specter'?3.8:2.75,hover=type==='specter'?Math.sin(clock*2+e.phase)*.2:0;
 const y=hover+(e.hit>0?.05*Math.sin(clock*45):0);const recoil=Math.sin(Math.PI*clamp((e.hitRecoil||0)/.53,0,1))*.40;
 const lod=distance(player,e)<22&&quality!=='low',r=lod?7:4,sides=lod?12:7;
 m.ellipsoid(0,h*.37+y,-recoil*.2,.43*size,.60*size,.32*size,tint(base,.72),0,r,sides);
 m.ellipsoid(0,h*.69+y,-recoil*.35,.64*size,.65*size,.43*size,e.hitRecoil>0?tint(base,1.38):base,0,r,sides);
 m.ellipsoid(0,h*.92+y,.11-recoil*.44,.40*size,.48*size,.37*size,tint(base,1.09),0,r,sides);
 if(type==='skeleton'){for(let j=0;j<4;j++)m.box(0,h*.49+j*.15,.37,.68-.065*j,.055,.08,tint(base,1.26));m.box(0,h*.82+y,.43,.35,.14,.08,[.13,.12,.14]);}
 if(type==='goblin'){for(const side of [-1,1])m.tri([side*.29,h*.91+y,.08],[side*.76,h*1.04+y,-.04],[side*.27,h*1.02+y,.13],tint(base,.9));}
 if(type==='knight'||type==='sentinel'){for(const side of [-1,1])m.ellipsoid(side*.70,h*.77+y,0,.31,.22,.34,tint(base,1.24),0,r,sides);m.box(0,h*.93+y,.45,.63,.11,.09,[.03,.04,.07]);}
 for(let s of [-1,1]){
    let step=Math.sin(e.animation+(s>0?0:Math.PI))*.3;
    limb(m,[s*.48*size,h*.32+y,0],[s*.48*size,h*.16+y,step],.2*size,.14*size,tint(base,.68));
    m.box(s*.48*size,.16+y,step,.38*size,.32,.58*size,tint(base,.48));
    const shoulder=[s*.81*size,h*.74+y,0],elbow=[s*1.1*size,h*.57+y,.15+wind*.35],hand=[s*.85*size,h*.36+y,.26+wind*.55];
    limb(m,shoulder,elbow,.19*size,.14*size,base);
    limb(m,elbow,hand,.17*size,.12*size,tint(base,.83));
 }
 m.sphere(-.19*size,h*.94+y,.48*size,.12*size,c.accent,3,6,1);
 m.sphere(.19*size,h*.94+y,.48*size,.12*size,c.accent,3,6,1);
 m.spike(0,h*.99+y,0,.4*size,.63*size,c.accent,.45);
 if(boss){
   for(let s of [-1,1])m.spike(s*.6*size,h*.89+y,0,.42*size,1.3*size,c.accent,.6);
   let reach=1.0+wind*.9;
   limb(m,[1.55*size,h*.52+y,.55*size],[1.55*size+wind*1.5,h*.5+y,2.55*size*reach],.22*size,.04*size,c.accent,.7);
   m.ring(0,.16,0,3.9,.17,c.accent,.52);
 }else if(type==='warlock'||type==='specter'){
   m.spike(0,h*.95+y,0,.6,1.5,c.accent,.6);
 }
}

// One hidden collectible reliquary per biome: explore side paths to level up.
function relicPos(idx){let z=idx*LEN+LEN*.38+(idx%3)*4;return [roadCenter(z)+(idx%2?-1:1)*23,z]}
function relicModel(m,idx){
 const p=relicPos(idx),xx=p[0],zz=p[1],yy=height(xx,zz),c=regions[idx],found=game.relics[idx];
 if(found)return;
 const lift=Math.sin(clock*1.7+idx)*.14;
 m.box(xx,yy+.45,zz,2.1,.9,1.2,tint(c.stone,.62));
 m.box(xx,yy+1.05,zz,2.05,.3,1.3,tint(c.accent,.72),.20);
 m.box(xx,yy+1.15,zz,1.25,.2,1.35,tint(c.stone,.9));
 m.spike(xx,yy+1.35+lift,zz,.42,1.2,c.accent,1.05);
 m.ring(xx,yy+.14,zz,2.55,.12,c.accent,.6);
}

// Procedural cursed wildlife with animated quadruped limbs, glowing eyes and flying bats.
function wildlifeModel(mesh,b){
 const m=mesh,phase=clock*(b.kind==='bat'?11:7)+b.phase;
 if(b.kind==='bat'){
  const dark=[.085,.075,.13],wing=[.16,.12,.23];
  m.ellipsoid(0,.1,0,.42,.36,.38,dark,.05,5,7);
  m.sphere(0,.16,.26,.25,dark,4,7);
  for(const side of [-1,1]){
    let flap=Math.sin(phase)*.9;
    m.quad([side*.22,.2,0],[side*1.25,.46+flap,.2],[side*2.6,.16+flap*1.6,-.1],[side*.60,-.18,-.52],wing,.14);
    m.cone(side*.16,.37,.26,.13,.42,dark,4,0,.0);
  }
  for(const x of [-.12,.12])m.sphere(x,.19,.46,.065,[1,.13,.29],3,5,2);
  return;
 }
 const crawler=b.kind==='crawler',stag=b.kind==='stag',f=crawler?1.25:stag?1.45:1,hide=b.hit>0?.25:0;
 const col=stag?[.17,.30,.35]:crawler?[.22,.17,.27]:[.22,.19,.23],bone=[.48,.40,.40],eye=stag?[.35,.91,1]:[1,.18,.28];
 const sway=Math.sin(phase)*.08;
 m.ellipsoid(0,.98*f+sway,.00,1.25*f,.62*f,.55*f,col,.03,6,10);
 for(let i=0;i<5;i++)m.spike(0,1.40*f,(-.81+i*.33)*f,.14*f,.40*f,crawler?[.59,.45,.55]:[.32,.30,.40],.08);
 
 m.ellipsoid(0,1.24*f,.83*f,.55*f,.49*f,.49*f,crawler?bone:col,.05,5,8);
 m.ellipsoid(0,1.08*f,1.27*f,.39*f,.27*f,.54*f,crawler?bone:[.36,.30,.35],.02,5,7);
 for(let q of [-1,1]){
   m.cone(q*.27*f,.94*f,1.45*f,.065*f,.28*f,[.89,.84,.77],4,0,.10);
   m.cone(q*.33*f,1.42*f,.91*f,.18*f,.50*f,col,5,0,.01);
 }
 
 for(const side of [-1,1]){
  const step=Math.sin(phase+ (side<0?0:Math.PI))*.34;
  for(const z of [-.8,.65]){
    const zp=z+step;
    limb(m,[side*.63*f,.92*f,z*f],[side*.74*f,.45*f,(z+step)*f],.22*f,.16*f,col,0,5);
    limb(m,[side*.74*f,.45*f,(z+step)*f],[side*.79*f,.12,(z+step*.8+.06)*f],.15*f,.10*f,bone,.02,5);
  }
  m.cone(side*.34*f,1.55*f,1.01*f,.21*f,.62*f,col,5,0);
  m.sphere(side*.25*f,1.37*f,1.24*f,.13*f,eye,4,6,2.3+hide);
  if(crawler){limb(m,[side*.68*f,1.05*f,.05],[side*1.35*f,.75*f,.57],.13*f,.045*f,bone,.05,5);}
  if(stag){limb(m,[side*.29*f,1.7*f,1.04*f],[side*.98*f,3.10*f,1.22*f],.13*f,.03*f,[.44,.9,.85],.35,5);
    limb(m,[side*.98*f,3.10*f,1.22*f],[side*1.42*f,3.4*f,1.39*f],.07*f,.018*f,[.50,1,.94],.55,5);
  }
 }
 limb(m,[0,1.02*f,-.84*f],[-Math.sin(phase*.25)*.45,1.38*f,-1.9*f],.22*f,.02*f,col,.05,5);
 m.ring(0,.05,0,1.27*f,.10,[.08,.045,.1],0);
}
function buildDynamic(){let mesh=new Mesh();const near=enemies.filter(e=>!e.dead&&Math.abs(e.z-player.z)<65&&Math.abs(e.x-player.x)<65);
 if(viewMode!=='fpp'){let pm=new Mesh(player.x,player.y,player.z,player.angle);playerModel(pm);appendVertices(mesh.d,pm.d);}
 // Contact shadow stays on the actual terrain during jumps.
 let shadow=new Mesh();shadow.ring(player.x,height(player.x,player.z)+.025,player.z,1.03+Math.abs(player.y-height(player.x,player.z))*.10,.24,[.045,.055,.075],0);appendVertices(mesh.d,shadow.d);
 // Sword ribbon: geometry follows the REAL sword tip from the articulated arm.
 if(player.swordTrail.length>1){
   let fx=new Mesh();const trail=player.swordTrail;
   for(let i=1;i<trail.length;i++){
      let a=trail[i-1],b=trail[i],alpha=Math.min(a.life,b.life)/.23;
      const blend=clamp(alpha*(.30+.7*i/trail.length),0,1);
      const blade=(k)=>add(k.base,scale(sub(k.tip,k.base),.84));
      const nearTip=(k)=>add(k.base,scale(sub(k.tip,k.base),.34));
      const clr=tint(COMBOS[b.combo].color,.16+.48*blend);
      fx.quad(nearTip(a),blade(a),blade(b),nearTip(b),clr,.23+.85*blend);
      fx.quad(blade(a),a.tip,b.tip,blade(b),tint(COMBOS[b.combo].color,.23+.79*blend),.48+1.6*blend);
      if(i%4===0){
         limb(fx,b.base,b.tip,.042+blend*.045,.009,COMBOS[b.combo].color,.38+blend*1.2,5);
      }
   }
   appendVertices(mesh.d,fx.d);
 }

 for(const b of wildlife){
  if(b.dead||Math.abs(b.z-player.z)>68||Math.abs(b.x-player.x)>68||(b.kind==='bat'&&!ldx.batsOut()))continue;
  const model=new Mesh(b.x,b.y,b.z,b.angle);
  wildlifeModel(model,b);appendVertices(mesh.d,model.d);
 }
 for(let e of near){
  let em=new Mesh(e.x,e.y+(e.type==='specter'?.6+Math.sin(clock*2+e.phase)*.24:0),e.z,e.angle);enemyModel(em,e);appendVertices(mesh.d,em.d);
  let aura=new Mesh();
  aura.ring(e.x,e.y+.05,e.z,e.boss?2.7:1,.18,[.045,.05,.065],0);
  if(e.hit>0)aura.ring(e.x,e.y+.2,e.z,e.boss?4.1:1.6,.13,[1,.18,.14],.7);
  if(e.windup>0){let k=e.boss?4.8:3.05,ratio=1-e.windup/(e.boss?.96:.57);
    aura.ring(e.x,e.y+.1,e.z,k,.065+ratio*.19,[1,.12,.09],.8+ratio*.9);
  }appendVertices(mesh.d,aura.d);
 }
 // Crates from V3: wood frame, metal straps, glowing relic core, no static dead geometry.
 for(const b of breakables){
   if(b.dead||Math.abs(b.x-player.x)>59||Math.abs(b.z-player.z)>65)continue;
   const m=new Mesh(),base=b.y,col=b.kind==='relic'?[.23,.39,.47]:[.40,.22,.11];
   m.box(b.x,base+1.15,b.z,2.25,2.25,2.25,col);
   m.box(b.x,base+1.15,b.z,2.43,.23,2.43,[.58,.48,.32]);
   m.box(b.x,base+1.15,b.z,2.43,.24,2.43,[.58,.48,.32]);
   for(const side of [-1,1]){m.box(b.x+side*.95,base+1.1,b.z,.18,2.15,2.36,[.58,.46,.30]);m.box(b.x,base+1.1,b.z+side*.95,2.36,2.15,.18,[.59,.46,.30]);}
   if(b.kind==='relic'){m.spike(b.x,base+1.35,b.z,.47,1.1,[.28,.87,1],1.65);m.ring(b.x,base+2.4,b.z,1.0,.09,[.3,.92,1],1.2);}
   appendVertices(mesh.d,m.d);
 }
 for(const d of debris){if(Math.abs(d.z-player.z)>65)continue;const m=new Mesh();m.box(d.x,d.y,d.z,.2,.24,.18,d.col,.26,d.rot);appendVertices(mesh.d,m.d)}
 const z=game.zone,reg=regions[z];
 for(let j=Math.max(0,z-1);j<=Math.min(6,z+1);j++){
 let point=shrinePoint(j),zz=point.z,xx=point.x,yy=height(xx,zz);
 if(Math.abs(zz-player.z)<65){let crystal=new Mesh();crystal.spike(xx,yy+3.4+Math.sin(clock*1.9+j)*.35,zz,1.05,4.6,game.seals[j]?[.24,.2,.27]:regions[j].accent,game.seals[j]?.17:1.2);crystal.ring(xx,yy+5,zz,2.25,.09,regions[j].accent,game.seals[j]?.1:.8);appendVertices(mesh.d,crystal.d)}
 }
 // Every gateway is traversable. The last gateway glows as the actual win trigger.
 for(let j=Math.max(0,game.zone-1);j<=Math.min(6,game.zone);j++){
   const g=portalPoint(j);if(Math.abs(player.z-g.z)>75)continue;
   const mag=j===6?1.5:.55,col=j===6?[.49,1,.79]:regions[j].accent;
   let portalFX=new Mesh(),base=height(g.x,g.z);
   portalFX.ring(g.x,base+.16,g.z,4.6+(j===6?Math.sin(clock*2)*.2:0),.12,col,.55*mag);
   for(let k=0;k<7;k++){
     const phi=k*TAU/7+clock*(j===6?.55:.17),rr=3.4+Math.sin(clock*2.7+k)*.14;
     let x=g.x+Math.cos(phi)*rr,y=base+3.4+Math.sin(phi*2+clock)*1.5,z=g.z+Math.sin(phi)*1.7;
     portalFX.spike(x,y,z,.13+(j===6?.10:0),.7+(j===6?.4:0),col,.7*mag);
   }
   if(j===6){portalFX.ring(g.x,base+.14,g.z,7.5,.16,col,1.1);portalFX.spike(g.x,base+9+Math.sin(clock*1.7)*.2,g.z,1.0,3.8,col,1.4);}
   appendVertices(mesh.d,portalFX.d);
 }
 for(let j=Math.max(0,game.zone-1);j<=Math.min(6,game.zone+1);j++){let p=relicPos(j);if(Math.abs(player.z-p[1])<74){let rm=new Mesh();relicModel(rm,j);appendVertices(mesh.d,rm.d)}}
 discoveryMesh(mesh);
 if(game.flying){let skyAura=new Mesh();skyAura.ring(player.x,player.y-.45,player.z,3.6,.28,[.32,.96,.86],.9);skyAura.ring(player.x,player.y-.55,player.z,4.3,.09,[.55,.88,1],.65);skyAura.spike(player.x,player.y-1.2+Math.sin(clock*4)*.2,player.z,.7,1.6,[.45,1,1],.42);appendVertices(mesh.d,skyAura.d)}
 for(const a of attacks){
  const am=new Mesh();
  if(a.kind==='fire'){
   const flicker=.94+.16*Math.sin(a.phase*2);
   am.sphere(a.x,a.y,a.z,a.size*flicker,[1,.59,.21],5,10,2);
   am.sphere(a.x,a.y,a.z,a.size*.55,[1,.92,.52],4,8,3);
   am.spike(a.x-a.vx*.02,a.y-(a.vy||0)*.02,a.z-a.vz*.02,a.size*.28,1.5,[1,.27,.08],1.1);
   const sp=Math.hypot(a.vx,a.vy||0,a.vz)||1;
   for(let k=0;k<(quality==='low'?2:4);k++){
      const back=(k+.75)*(.31+Math.sin(a.phase+k)*.05);
      const t=k*TAU/4+a.phase*.28,rad=.11+k*.065;
      const px=a.x-a.vx/sp*back+Math.sin(t)*rad,py=a.y-(a.vy||0)/sp*back+Math.cos(t)*rad,pz=a.z-a.vz/sp*back+Math.cos(t*1.4)*rad;
      am.sphere(px,py,pz,a.size*(.46-k*.08),k%2?[1,.27,.08]:[1,.85,.31],3,6,.9);
   }
  }else am.sphere(a.x,a.y,a.z,a.size,[.94,.26,.65],4,8,1.2);
  appendVertices(mesh.d,am.d);
 }
 if(player.fireCast>0){
  const u=player.fireCast/.39,ang=player.fireAimYaw??orbit,pitch=orbitPitch,fx=player.x+Math.sin(ang)*1.05,fy=player.y+1.65+(1-u)*.32,fz=player.z+Math.cos(ang)*1.05;
  const pm=new Mesh();pm.sphere(fx,fy,fz,.25+u*.3,[1,.56,.19],5,9,1.7);pm.ring(fx,fy,fz,.52+(1-u)*.8,.06,[1,.77,.29],1.2);pm.spike(fx,fy-.15,fz,.25,.35,[1,.92,.48],2.2);appendVertices(mesh.d,pm.d);
 }
 for(let p of pickups){if(Math.abs(p.z-player.z)>55)continue;let pm=new Mesh();pm.spike(p.x,p.y+.15+Math.sin(clock*3+p.phase)*.3,p.z,.19,.57,[.99,.78,.39],1.4);appendVertices(mesh.d,pm.d)}
 let maxPart=quality==='low'?22:quality==='balanced'?55:100;for(let p of particles.slice(-maxPart)){if(Math.abs(p.z-player.z)>62)continue;let pm=new Mesh();pm.box(p.x,p.y,p.z,p.size,p.size,p.size,p.col,1.6);appendVertices(mesh.d,pm.d)}
 // Procedural drifting embers and floating fireflies.
 let n=quality==='low'?8:quality==='balanced'?20:45;for(let j=0;j<n;j++){let phase=hash(j*23)*TAU,x=player.x+Math.sin(j*11.5+clock*.11)*38,z=player.z+Math.cos(j*19.25-clock*.13)*31,y=1.5+hash(j*79)*13+Math.sin(clock*.8+phase)*1.5;
 let pm=new Mesh();pm.box(x,y,z,.06,.09,.06,reg.accent,.9);appendVertices(mesh.d,pm.d)}
 return mesh.get();
}
function computeCamera(dt){
 let horizontal=orbit,dist=10.8+(player.attackTime>0?-.45*Math.sin(Math.PI*clamp(player.attackClock/player.attackDuration,0,1)):0),pitch=orbitPitch;
 if(game.state==='playing'){
   dist+=clamp(Math.hypot(player.vx,player.vz)-9,0,10)*.13;
   if(player.dashTime>0)dist+=game.flying?1.4:.75;
 }
 // Portrait phone framing pulls back to keep the full hero and nearby enemies visible.
 const aspect=canvas.width/Math.max(1,canvas.height),portraitZoom=clamp(.94/aspect,1,1.55);
 dist*=portraitZoom;
 if(game.state==='title'){horizontal=Math.sin(clock*.13)*.22;dist=15*portraitZoom;pitch=.28}
 // Camera spring is on the focal anchor, not on input. W/S stay consistent even during turns.
 const catchUp=1-Math.exp(-dt*(player.dashTime>0?34:18));
 if(!cameraReady){cameraAnchor=[player.x,player.y,player.z];cameraReady=true;}
 cameraAnchor[0]=mix(cameraAnchor[0],player.x,catchUp);
 cameraAnchor[1]=mix(cameraAnchor[1],player.y,catchUp);
 cameraAnchor[2]=mix(cameraAnchor[2],player.z,catchUp);
 const x=cameraAnchor[0],z=cameraAnchor[2],y=cameraAnchor[1];
 const lookAhead=5.4-(portraitZoom-1)*1.05;
 let target=[x+Math.sin(horizontal)*lookAhead,y+1.85-lookAhead*Math.tan(pitch),z+Math.cos(horizontal)*lookAhead];
 let eye=[x-Math.sin(horizontal)*dist*Math.cos(pitch),y+2.05+dist*Math.sin(pitch),z-Math.cos(horizontal)*dist*Math.cos(pitch)];
 if(viewMode==='fpp'&&game.state==='playing'){eye=[x,y+2.55,z];target=[x+Math.sin(horizontal)*16*Math.cos(pitch),y+2.55-16*Math.sin(pitch),z+Math.cos(horizontal)*16*Math.cos(pitch)];}
 // Sweep a small camera volume from the hero to the desired camera position.
 if(viewMode!=='fpp'||game.state!=='playing'){
  const anchor=[x,y+2.05,z],delta=eye.map((v,i)=>v-anchor[i]);
  const len=Math.hypot(...delta),steps=Math.max(1,Math.ceil(len/.25));let clear=0;
  for(let i=1;i<=steps;i++){
   const t=i/steps,px=anchor[0]+delta[0]*t,py=anchor[1]+delta[1]*t,pz=anchor[2]+delta[2]*t;
   if(blocking(px,pz,.32,py-.32,.64)||py<height(px,pz)+.35)break;
   clear=t;
  }
  if(clear<1){const safe=Math.max(0,clear-.2/Math.max(len,.2));eye=anchor.map((v,i)=>v+delta[i]*safe);}
 }
 // Prevent camera clipping below elevated terrain.
 if(viewMode!=='fpp'||game.state!=='playing')eye[1]=Math.max(eye[1],height(eye[0],eye[2])+.35);
 if(shake>0){let amount=shake*.6,n=Math.hypot(...impactDirection)||1,pulse=Math.sin(clock*79)*amount*.65;eye[0]+=impactDirection[0]/n*pulse;eye[2]+=impactDirection[1]/n*pulse;eye[1]+=Math.sin(clock*97)*amount*.32;}
 if(player.cameraKick>0){eye[1]+=player.cameraKick*.41;target[1]-=player.cameraKick*.33;}
 camEye=eye;camFocus=target;
 let view=lookAt(eye,target),proj=perspective(Math.PI/(player.dashTime>0?2.85:3.1),canvas.width/canvas.height,.3,270);
 viewProj=multiply(proj,view);
 const forward=norm(sub(target,eye)),right=norm(cross(forward,[0,1,0])),up=norm(cross(right,forward));
 cameraBasis={forward,right,up,focal:canvas.height/(2*Math.tan(Math.PI/(player.dashTime>0?5.9:6.26)))};
}
let submittedTriangles=0,visibleChunks=0;
function paintWebGL(dynamicData){drawCalls=0;submittedTriangles=0;visibleChunks=0;if(shadowState&&quality!=='low'&&shadowTick++%2===0)paintShadowMap(dynamicData);let c=regions[game.zone],a=indexLocations;cinematicPipeline?.begin(canvas.width,canvas.height,quality);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(glP);if(materialLibrary)materialLibrary.bind(a,quality);else gl.uniform1f(a.materialDetail,0);
 gl.uniformMatrix4fv(a.vp,false,viewProj);gl.uniform3f(a.cam,...camEye);gl.uniform3f(a.fog,...c.fog);gl.uniform3f(a.light,-.42,.86,.34);gl.uniform1f(a.time,clock);
 const torchStep=(LEN-12)/28;
 const z0=game.zone*LEN+3+Math.max(0,Math.min(28,Math.round((player.z-game.zone*LEN-3)/torchStep)))*torchStep;
 const z1=z0+(player.z>z0?torchStep:-torchStep);
 const x0=roadCenter(z0)+8.4,x1=roadCenter(z1)-8.4;
 gl.uniform4f(a.torch0,x0,height(x0,z0)+1.8,z0,16);
 gl.uniform4f(a.torch1,x1,height(x1,z1)+1.8,z1,16);
 gl.uniform3f(a.torchColor,.99,.57,.22);
 gl.uniformMatrix4fv(a.sVP,false,shadowMatrix||new Float32Array(16));gl.uniform1f(a.shadows,shadowState&&quality!=='low'?1:0);gl.uniform1f(a.shadowTexel,shadowState?1/shadowState.sz:1/1024);
 if(shadowState){gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,shadowState.tex);gl.uniform1i(a.shadow,0);}
 gl.uniform1f(a.worldSurface,1);let k=zoneOf(player.z),range=1,frustum=LandlordGeometry.planes(viewProj);
 for(let j=Math.max(0,k-range);j<=Math.min(6,k+range);j++){
 let r=ensureGpuRealm(j);if(!r)continue;bindData(r.buffer);for(const chunk of r.chunks){if(!LandlordGeometry.visible(chunk,frustum))continue;gl.drawArrays(gl.TRIANGLES,chunk.first,chunk.count);drawCalls++;visibleChunks++;submittedTriangles+=chunk.count/3;}
 }
 gl.uniform1f(a.worldSurface,0);gl.bindBuffer(gl.ARRAY_BUFFER,vbo);gl.bufferData(gl.ARRAY_BUFFER,dynamicData,gl.DYNAMIC_DRAW);bindData(vbo);gl.drawArrays(gl.TRIANGLES,0,dynamicData.length/10);drawCalls++;submittedTriangles+=dynamicData.length/30;
 drawCalls+=cinematicPipeline?.end()||0;
}
function paintCPU(dynamicData){const W=canvas.width,H=canvas.height,c=regions[game.zone],dpr=W/innerWidth;
 ctx.clearRect(0,0,W,H);
 // A solid fallback ground palette hides clipped faces on devices without WebGL.
 const backdrop=ctx.createLinearGradient(0,H*.29,0,H);
 backdrop.addColorStop(0,`rgb(${c.ground.map(v=>Math.round(v*162)).join(',')})`);
 backdrop.addColorStop(1,`rgb(${c.ground.map(v=>Math.round(v*120)).join(',')})`);
 ctx.fillStyle=backdrop;ctx.fillRect(0,H*.34,W,H*.66);
 // Software perspective mesh renderer: full 3D geometry with 3D camera and real lighting.
 const b=cameraBasis;if(!b)return;
 const proj=(xx,yy,zz)=>{let rx=xx-camEye[0],ry=yy-camEye[1],rz=zz-camEye[2],depth=rx*b.forward[0]+ry*b.forward[1]+rz*b.forward[2];if(depth<.5)return null;let k=b.focal/depth;return [W/2+(rx*b.right[0]+ry*b.right[1]+rz*b.right[2])*k,H/2-(rx*b.up[0]+ry*b.up[1]+rz*b.up[2])*k,depth]};
 let faces=[],maxFaces=quality==='low'?2400:quality==='balanced'?4500:7500;
 const submit=(data,step=1,start=0,end=data.length/30)=>{let count=Math.min(data.length/30,end);for(let j=start;j<count;j+=step){let i=j*30,p=proj(data[i],data[i+1],data[i+2]),q=proj(data[i+10],data[i+11],data[i+12]),r=proj(data[i+20],data[i+21],data[i+22]);if(!p||!q||!r)continue;
 let minx=Math.min(p[0],q[0],r[0]),maxx=Math.max(p[0],q[0],r[0]),miny=Math.min(p[1],q[1],r[1]),maxy=Math.max(p[1],q[1],r[1]);if(maxx<0||minx>W||maxy<0||miny>H)continue;
 let normal=[data[i+3],data[i+4],data[i+5]],color=[data[i+6],data[i+7],data[i+8]],em=data[i+9];let f=.41+.66*Math.max(0,dot(normal,[-.42,.86,.34])),fog=clamp(((p[2]+q[2]+r[2])/3-26)/133,0,.93),col=color.map((v,k)=>clamp(mix(v*f+v*em*1.6,c.fog[k],fog),0,1));let rgb=col.map(v=>Math.round(Math.pow(v,.82)*255));
 faces.push({p,q,r,z:(p[2]+q[2]+r[2])/3,col:`rgb(${rgb.join(',')})`});}
 };
 const k=zoneOf(player.z);for(let j=Math.max(0,k-1);j<=Math.min(6,k+1);j++){
  if(j!==k&&Math.abs(player.z-(j+.5)*LEN)>LEN*.6)continue;
  // Never skip a ground triangle: sampling whole meshes creates visible holes.
  submit(cpuMeshes[j],1,0,1740);
  submit(cpuMeshes[j],quality==='low'?17:quality==='balanced'?13:9,1740);
 }
 submit(dynamicData,quality==='low'?2:1);
 faces.sort((a,b)=>b.z-a.z);
 ctx.lineWidth=.4;for(let f of faces){ctx.fillStyle=f.col;ctx.beginPath();ctx.moveTo(f.p[0],f.p[1]);ctx.lineTo(f.q[0],f.q[1]);ctx.lineTo(f.r[0],f.r[1]);ctx.closePath();ctx.fill()}
}
// World-space GPU-independent bloom, animated lanterns, fireflies and distant haze.
const atmosphere=$('atmosphere');const atmosphereCtx=atmosphere.getContext('2d',{alpha:true});
let atmosphereScale=1;
function resizeAtmosphere(){const r=Math.min(devicePixelRatio||1,1.5);atmosphereScale=r;
 const w=Math.max(2,Math.round(innerWidth*r)),h=Math.max(2,Math.round(innerHeight*r));
 if(atmosphere.width!==w||atmosphere.height!==h){atmosphere.width=w;atmosphere.height=h}
}
function projectAtmos(x,y,z){
 const b=cameraBasis;if(!b)return null;
 const X=x-camEye[0],Y=y-camEye[1],Z=z-camEye[2];
 const depth=X*b.forward[0]+Y*b.forward[1]+Z*b.forward[2];
 if(depth<1.3||depth>170)return null;
 const focal=innerHeight/(2*Math.tan(Math.PI/(player.dashTime>0?5.7:6.2)));
 return {x:innerWidth/2+(X*b.right[0]+Y*b.right[1]+Z*b.right[2])*focal/depth,
 y:innerHeight/2-(X*b.up[0]+Y*b.up[1]+Z*b.up[2])*focal/depth,depth};
}
function glowAt(f,x,y,z,r,color,weight=1){
 const p=projectAtmos(x,y,z);if(!p||p.x< -100||p.x>innerWidth+100||p.y< -100||p.y>innerHeight+100)return;
 const s=Math.min(145,r*innerHeight/p.depth*0.49);
 if(s<1)return;const g=f.createRadialGradient(p.x,p.y,0,p.x,p.y,s);
 g.addColorStop(0,`rgba(${color},${Math.min(.72,.28*weight)})`);
 g.addColorStop(.14,`rgba(${color},${Math.min(.38,.16*weight)})`);
 g.addColorStop(.48,`rgba(${color},${Math.min(.09,.038*weight)})`);g.addColorStop(1,`rgba(${color},0)`);
 f.fillStyle=g;f.beginPath();f.arc(p.x,p.y,s,0,TAU);f.fill();
}
function drawAtmosphere(){
 if(!atmosphereCtx)return;resizeAtmosphere();const f=atmosphereCtx;
 f.setTransform(atmosphereScale,0,0,atmosphereScale,0,0);f.clearRect(0,0,innerWidth,innerHeight);ldx.draw(f);
 drawCombatReadability(f);
 if(quality==='low')return;
 f.save();f.globalCompositeOperation='screen';
 const c=regions[game.zone],base=game.zone*LEN,flame=game.zone===0?'255,128,57':game.zone===1?'135,239,161':game.zone===5?'75,212,255':'234,156,235';
 // Flames on each side of the ancient road.
 for(let j=0;j<29;j++)for(const side of [-1,1]){
   let z=base+j*(LEN-12)/28+3;if(Math.abs(z-player.z)>63)continue;
   let x=roadCenter(z)+side*(8.4+hash(j*3+game.zone)*.9);
   glowAt(f,x,height(x,z)+1.25,z,1.85,flame,.45+.12*Math.sin(clock*5+j));
 }
 for(let j=Math.max(0,game.zone-1);j<=Math.min(6,game.zone+1);j++){
  let z=shrinePoint(j).z;
  if(Math.abs(z-player.z)<105){glowAt(f,shrinePoint(j).x,height(shrinePoint(j).x,z)+5.8,z,12,flame,game.seals[j]?.35:1.5);
   const p=relicPos(j);if(!game.relics[j]&&Math.abs(p[1]-player.z)<83)glowAt(f,p[0],height(p[0],p[1])+1.6,p[1],4.8,flame,.78);
  }
 }
 for(let e of enemies){if(e.dead||e.zone!==game.zone)continue;
   if(Math.abs(e.z-player.z)>44)continue;
   glowAt(f,e.x,e.y+(e.boss?5.1:2.7),e.z,e.boss?7:2.5,flame,e.boss?.72:.23);
 }
 glowAt(f,player.x+Math.sin(player.angle)*.65,player.y+2.65,player.z+Math.cos(player.angle)*.65,4.4,'112,199,255',.58+(player.attackTime>0?1.25:0));
 // Motion-blurred sword trail: translucent blue/purple/amber arc through actual blade positions.
 if(player.swordTrail.length>1){
    const samples=player.swordTrail,colors=['133,225,255','202,165,255','255,190,107'];
    f.save();f.lineJoin='round';f.lineCap='round';f.globalCompositeOperation='screen';
    for(let i=1;i<samples.length;i++){
      const a=samples[i-1],b=samples[i];
      let p1=projectAtmos(...a.tip),p2=projectAtmos(...b.tip);
      let v1=projectAtmos(...a.base),v2=projectAtmos(...b.base);
      if(!p1||!p2)continue;
      const freshness=Math.min(a.life,b.life)/.23,weight=freshness*(i/samples.length);
      const w=clamp(5.8*innerHeight/Math.max(13,p2.depth),1.4,24);
      const color=colors[b.combo];
      if(v1&&v2){
        f.fillStyle=`rgba(${color},${(weight*.13).toFixed(3)})`;
        f.beginPath();f.moveTo(v1.x,v1.y);f.lineTo(p1.x,p1.y);f.lineTo(p2.x,p2.y);f.lineTo(v2.x,v2.y);f.closePath();f.fill();
      }
      f.strokeStyle=`rgba(${color},${(weight*.14).toFixed(3)})`;f.lineWidth=w*5.2;f.beginPath();f.moveTo(p1.x,p1.y);f.lineTo(p2.x,p2.y);f.stroke();
      f.strokeStyle=`rgba(${color},${(weight*.57).toFixed(3)})`;f.lineWidth=w*1.75;f.beginPath();f.moveTo(p1.x,p1.y);f.lineTo(p2.x,p2.y);f.stroke();
      f.strokeStyle=`rgba(245,252,255,${(weight*.92).toFixed(3)})`;f.lineWidth=w*.40;f.beginPath();f.moveTo(p1.x,p1.y);f.lineTo(p2.x,p2.y);f.stroke();
    }
    f.restore();
 }
 for(const h of hitFlashes){
   const k=projectAtmos(h.x,h.y,h.z);if(!k)continue;
   const opacity=h.life/h.max,r=(1-opacity)*80+12,col=h.combo===2?'255,188,108':'167,229,255';
   const outer=f.createRadialGradient(k.x,k.y,1,k.x,k.y,r);
   outer.addColorStop(0,`rgba(255,255,255,${opacity*.42})`);
   outer.addColorStop(.24,`rgba(${col},${opacity*.26})`);outer.addColorStop(1,`rgba(${col},0)`);
   f.fillStyle=outer;f.beginPath();f.arc(k.x,k.y,r,0,TAU);f.fill();
   f.strokeStyle=`rgba(${col},${opacity*.49})`;f.lineWidth=1.3+opacity*2;
   f.beginPath();f.ellipse(k.x,k.y,r*.82,r*.46,-.22,0,TAU);f.stroke();
 }
 for(let a of attacks)glowAt(f,a.x,a.y,a.z,5.5,'255,133,63',1.8);
 for(let q of cacheSpots)if(q.zone===game.zone&&!chestTaken[q.id]&&Math.abs(q.z-player.z)<66){
  glowAt(f,q.x,height(q.x,q.z)+1.4,q.z,3.7,'248,192,111',.72);
 }
 for(let q of healingWells)if(q.zone===game.zone&&Math.abs(q.z-player.z)<66){
  glowAt(f,q.x,height(q.x,q.z)+2.5,q.z,6.2,'82,245,186',.83);
 }
 // drifting ash / luminous suspended dust, never occluding control surface
 for(let j=0;j<(quality==='cinematic'?112:quality==='high'?75:quality==='balanced'?38:20);j++){
   let z=player.z+Math.sin(j*32.4+clock*.09)*44,x=player.x+Math.sin(j*10.7+clock*.1)*33;
   let y=.8+hash(j*67)*10+Math.sin(clock*.69+j)*1.25,p=projectAtmos(x,y,z);
   if(!p||p.x<0||p.x>innerWidth||p.y<0||p.y>innerHeight)continue;
   let alpha=(.17+.38*hash(j*91))*clamp((95-p.depth)/75,0,1);
   let rad=clamp(innerHeight*1.2/p.depth*.045,.3,2.6);
   f.fillStyle=`rgba(${flame},${alpha})`;f.beginPath();f.arc(p.x,p.y,rad,0,TAU);f.fill();
 }
 // Weather is biome-specific: ash, luminous spores, snow shards or cursed rain.
 const weather=game.zone===0?'ash':game.zone===1?'spores':game.zone===2?'dust':game.zone===3?'rain':game.zone===4?'embers':game.zone===5?'snow':'void';
 const count=quality==='cinematic'?88:quality==='high'?52:26;
 f.save();f.globalCompositeOperation='screen';f.lineCap='round';
 for(let i=0;i<count;i++){
  const seed=hash(i*91+game.zone*51),speed=weather==='rain'?310:weather==='snow'?60:weather==='spores'?32:92;
  const x=((hash(i*31+17)*innerWidth+clock*speed*(weather==='rain'?.38:.11))%(innerWidth+80))-40;
  const y=((hash(i*41+9)*innerHeight+clock*speed*(.45+seed*.6))%(innerHeight+80))-40;
  let alpha=weather==='rain'?.14:weather==='void'?.22:.18;
  f.strokeStyle=weather==='snow'?`rgba(185,245,255,${alpha})`:weather==='spores'?`rgba(151,255,169,${alpha})`:weather==='embers'?`rgba(255,172,79,${alpha})`:weather==='rain'?`rgba(183,198,241,${alpha})`:`rgba(204,178,237,${alpha})`;
  f.lineWidth=weather==='rain'?1:1.7;f.beginPath();f.moveTo(x,y);
  f.lineTo(x+(weather==='rain'?-9:2),y+(weather==='rain'?19:weather==='snow'?4:1));f.stroke();
 }
 f.restore();
 f.restore();
}

// ===== LANDLORD+ : siklus siang-malam, cuaca, AI persepsi, parry, kombo skill, event meteor, horor =====
const ldx={
 tod:.64,rain:0,fog:0,night:0,sun:1,wTarget:0,wT:45,noise:0,parryT:0,fireBuff:0,pulseBuff:0,evT:55,meteors:[],eyes:null,eyeT:12,flash:0,hudT:0,el:null,rainGain:null,
 init(){const b=$('bones');if(b&&b.parentNode){this.el=document.createElement('div');this.el.style.cssText='font:600 10px system-ui,sans-serif;letter-spacing:.2em;color:#c9b8a4;margin-top:5px;text-shadow:0 2px 8px #000';b.after(this.el)}},
 id(a,b){return language==='id'?a:b},
 sight(){return(1-.22*this.night)*(1-.38*this.rain)*(1-.3*this.fog)},
 hunt(b){return b.kind==='wolf'?1+.35*this.night:1},
 // AI musuh: penglihatan (jarak + kerucut pandang), pendengaran, ingatan singkat
 perceive(e,dd,dt){
  const R=(e.boss?34:26)*this.sight(),toP=Math.atan2(player.x-e.x,player.z-e.z);
  const seen=dd<R&&(dd<7||Math.abs(shortestTurn(e.angle||0,toP))<1.7),heard=dd<this.noise;
  if(seen||heard){e.seen=seen;e.mem=3.6;e.lkx=player.x;e.lkz=player.z;return true}
  e.seen=false;
  if((e.mem||0)>0){e.mem-=dt;if(Math.hypot(e.lkx-e.x,e.lkz-e.z)<1.8)e.mem=0;return e.mem>0}
  return false;
 },
 // Perfect Parry: tekan serang tepat sebelum pukulan musuh mendarat
 tryParry(e){
  if(this.parryT<=0)return false;this.parryT=0;
  e.windup=0;e.stagger=1.3;e.attack=Math.max(e.attack,1.5);
  const a=Math.atan2(e.x-player.x,e.z-player.z);e.knockVX=Math.sin(a)*8;e.knockVZ=Math.cos(a)*8;
  player.mp=Math.min(100,player.mp+22);player.invuln=Math.max(player.invuln,.45);
  burst(player.x+Math.sin(a)*1.2,player.y+1.3,player.z+Math.cos(a)*1.2,[1,.95,.7],22,.7);
  pulseSfx(1320,.1,'square',.05);pulseSfx(660,.18,'triangle',.04);shake=Math.max(shake,.12);
  showToast(this.id('✦ PARRY SEMPURNA','✦ PERFECT PARRY'),.7);return true;
 },
 // Kombo skill: Api + Pedang = tebasan berapi; Pulse + Dash = dash gelombang kejut
 armFire(){if(this.fireBuff<=0)showToast(this.id('✦ PEDANG BERAPI','✦ FLAMING BLADE'),.8);this.fireBuff=2.4;this.noise=Math.max(this.noise,22)},
 armPulse(){if(this.pulseBuff<=0)showToast(this.id('✦ DASH GELOMBANG SIAP','✦ SHOCK DASH READY'),.8);this.pulseBuff=2.2;this.noise=Math.max(this.noise,30)},
 flameSlash(){const a=player.angle;attacks.push({x:player.x+Math.sin(a)*1.2,y:player.y+1.4,z:player.z+Math.cos(a)*1.2,vx:Math.sin(a)*20,vz:Math.cos(a)*20,life:.45,kind:'fire',size:.95});burst(player.x+Math.sin(a)*1.6,player.y+1.4,player.z+Math.cos(a)*1.6,[1,.5,.2],14,.7)},
 shock(x,z,R,dmg){
  for(const e of enemies)if(!e.dead&&Math.hypot(e.x-x,e.z-z)<R){damageEnemy(e,dmg);e.stagger=.9;const a=Math.atan2(e.x-x,e.z-z);e.knockVX=Math.sin(a)*12;e.knockVZ=Math.cos(a)*12}
  burst(x,player.y+.6,z,[.5,.85,1],28,1);shake=Math.max(shake,.16);pulseSfx(140,.35,'sawtooth',.05);
  showToast(this.id('✦ GELOMBANG KEJUT','✦ SHOCKWAVE'),.7);this.pulseBuff=0;
 },
 // Event dunia acak: hujan meteor
 startMeteors(){
  for(let i=0;i<7;i++){const a=Math.random()*TAU,r=6+Math.random()*20;this.meteors.push({x:player.x+Math.sin(a)*r,z:player.z+Math.cos(a)*r,t:2.2+i*.9,fall:1.3,i})}
  showToast(this.id('☄ HUJAN METEOR — HINDARI LINGKARAN MERAH','☄ METEOR SHOWER — AVOID THE RED RINGS'),2.8);pulseSfx(120,.6,'sawtooth',.04);
 },
 stepMeteors(dt){
  for(let i=this.meteors.length-1;i>=0;i--){const m=this.meteors[i];m.t-=dt;if(m.t>0)continue;
   const h=height(m.x,m.z);
   burst(m.x,h+.6,m.z,[1,.55,.22],26,1.05);shake=Math.max(shake,.2);pulseSfx(70,.5,'sawtooth',.05);
   if(Math.hypot(player.x-m.x,player.z-m.z)<3.8&&player.y-h<4)takeHit(15);
   for(const e of enemies)if(!e.dead&&Math.hypot(e.x-m.x,e.z-m.z)<5)damageEnemy(e,e.boss?30:45);
   for(let k=0;k<2;k++)pickups.push({x:m.x+(Math.random()-.5)*3,z:m.z+(Math.random()-.5)*3,y:h+.5,life:24,value:3,phase:m.i+k});
   this.meteors.splice(i,1);
  }
 },
 update(dt){
  if(game.state!=='playing')return;
  this.tod=(this.tod+dt/420)%1;this.sun=Math.sin((this.tod-.25)*TAU);this.night=clamp(.2-this.sun*1.5,0,1);
  this.wT-=dt;if(this.wT<=0){this.wT=70+Math.random()*70;const r=Math.random();this.wTarget=r<.5?0:r<.8?1:2}
  const k=Math.min(1,dt*.18);this.rain+=((this.wTarget===1?1:0)-this.rain)*k;this.fog+=((this.wTarget===2?1:0)-this.fog)*k;
  this.noise=Math.max(0,this.noise-dt*34);this.parryT=Math.max(0,this.parryT-dt);
  this.fireBuff=Math.max(0,this.fireBuff-dt);this.pulseBuff=Math.max(0,this.pulseBuff-dt);this.flash=Math.max(0,this.flash-dt*2.4);
  if(this.rain>.6&&Math.random()<dt*.05){this.flash=.55;setTimeout(()=>pulseSfx(48,1,'sawtooth',.06),350+Math.random()*700)}
  this.evT-=dt;if(this.evT<=0){this.evT=80+Math.random()*70;this.startMeteors()}
  this.stepMeteors(dt);
  // Horor dinamis: mata menyala di kejauhan dan langkah tak terlihat saat malam
  this.eyeT-=dt;
  if(this.night>.55&&!this.eyes&&this.eyeT<=0){const a=player.angle+(Math.random()-.5)*2.4,r=22+Math.random()*12;this.eyes={x:player.x+Math.sin(a)*r,z:player.z+Math.cos(a)*r,t:4+Math.random()*2,s:Math.random()*9};this.eyeT=10+Math.random()*14;pulseSfx(62,.7,'sawtooth',.028)}
  if(this.eyes){this.eyes.t-=dt;if(this.eyes.t<=0||Math.hypot(player.x-this.eyes.x,player.z-this.eyes.z)<12)this.eyes=null}
  if(this.night>.55&&Math.random()<dt*.06){pulseSfx(88,.05,'square',.018);setTimeout(()=>pulseSfx(80,.05,'square',.018),260)}
  this.sound();this.hud(dt);this.extra(dt);
 },
 sound(){
  try{const ac=audioContext();if(!ac)return;
   if(!this.rainGain){const len=ac.sampleRate*2,buf=ac.createBuffer(1,len,ac.sampleRate),d=buf.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;
    const src=ac.createBufferSource();src.buffer=buf;src.loop=true;const hp=ac.createBiquadFilter();hp.type='highpass';hp.frequency.value=1100;
    const g=ac.createGain();g.gain.value=0;src.connect(hp);hp.connect(g);g.connect(window.LandlordAudio?.output?.()||ac.destination);src.start();this.rainGain=g}
   this.rainGain.gain.setTargetAtTime(this.rain*.045,ac.currentTime,.6)}catch(err){}
 },
 hud(dt){
  this.hudT-=dt;if(this.hudT>0||!this.el)return;this.hudT=.5;const n=this.night;
  const ph=n>.7?this.id('☾ MALAM','☾ NIGHT'):n>.25?(this.tod<.5?this.id('☾ FAJAR','☾ DAWN'):this.id('☾ SENJA','☾ DUSK')):this.id('☀ SIANG','☀ DAY');
  this.el.textContent=ph+(this.rain>.45?this.id(' · HUJAN',' · RAIN'):this.fog>.45?this.id(' · KABUT',' · FOG'):'');
 },
 draw(f){
  const W=innerWidth,H=innerHeight;f.save();
  if(this.night>.02){f.fillStyle='rgba(6,12,48,'+(.5*this.night)+')';f.fillRect(0,0,W,H)}
  const dusk=clamp(1-Math.abs(this.sun)*3.2,0,1);
  if(dusk>.02){f.fillStyle='rgba(255,120,55,'+(.12*dusk)+')';f.fillRect(0,0,W,H)}
  if(this.fog>.02||this.rain>.02){f.fillStyle='rgba(120,135,155,'+(.26*this.fog+.14*this.rain)+')';f.fillRect(0,0,W,H)}
  if(this.rain>.05){
   const n=Math.round((quality==='low'?55:quality==='balanced'?110:170)*this.rain);
   f.strokeStyle='rgba(175,205,235,'+(.32*this.rain)+')';f.lineWidth=1;f.beginPath();
   for(let i=0;i<n;i++){const x=((i*97.31+clock*70)%W+W)%W,y=((i*53.17+clock*820+i*13)%H+H)%H;f.moveTo(x,y);f.lineTo(x-5,y+17)}
   f.stroke();
  }
  if(this.flash>.01){f.fillStyle='rgba(220,230,255,'+(this.flash*.55)+')';f.fillRect(0,0,W,H)}
  for(const m of this.meteors){
   const h=height(m.x,m.z)+.25,p=projectAtmos(m.x,h,m.z),p2=projectAtmos(m.x+3.6,h,m.z);
   if(p&&p2){const r=Math.max(6,Math.hypot(p2.x-p.x,p2.y-p.y));f.strokeStyle='rgba(255,85,55,'+(.35+.35*Math.sin(clock*14))+')';f.lineWidth=2;f.beginPath();f.ellipse(p.x,p.y,r,r*.4,0,0,TAU);f.stroke()}
   if(m.t<m.fall){const u=1-m.t/m.fall;glowAt(f,m.x+8*(1-u),h+38*(1-u)+1,m.z+8*(1-u),3.4,'255,150,70',2.2)}
  }
  if(this.eyes){const e=this.eyes,h=height(e.x,e.z)+1.7;if(Math.sin(clock*1.7+e.s)<=.93){glowAt(f,e.x-.28,h,e.z,.5,'255,70,50',1.6);glowAt(f,e.x+.28,h,e.z,.5,'255,70,50',1.6)}}
  f.restore();
 }
};
ldx.init();
Object.assign(ldx,{
 hordeT:60,
 batsOut(){return this.night>.25},
 extra(dt){
  for(const e of enemies)if(e.boss&&!e.dead&&!e.p2&&e.hp<e.maxHp*.5&&Math.abs(e.z-player.z)<100){e.p2=true;e.speed*=1.25;e.projectileCD=Math.min(e.projectileCD,.8);burst(e.x,e.y+2,e.z,[1,.4,.2],40,1.4);shake=Math.max(shake,.35);pulseSfx(60,.9,'sawtooth',.06);showToast(this.id('✦ FASE 2 — PENJAGA MENGAMUK','✦ PHASE 2 — THE GUARDIAN RAGES'),1.6)}
  this.hordeT-=dt;const live=enemies.filter(e=>e.horde&&!e.dead);
  for(const e of live)if(Math.hypot(e.x-player.x,e.z-player.z)>95)e.dead=true;
  if(this.hordeT<=0&&this.night>.7&&!live.length&&!game.flying&&!enemies.some(e=>e.boss&&!e.dead&&Math.hypot(e.x-player.x,e.z-player.z)<60)){
   this.hordeT=100+Math.random()*80;
   for(let i=0;i<4;i++){const a=Math.random()*TAU,r=24+Math.random()*8,ne=makeEnemy(game.zone,i%5);ne.x=player.x+Math.sin(a)*r;ne.z=player.z+Math.cos(a)*r;ne.y=height(ne.x,ne.z);ne.homeX=ne.x;ne.homeZ=ne.z;ne.angle=a+Math.PI;ne.horde=true;ne.mem=6;ne.lkx=player.x;ne.lkz=player.z;enemies.push(ne)}
   showToast(this.id('✦ GEROMBOLAN MALAM MENYERANG','✦ NIGHT HORDE ATTACKS'),2.2);pulseSfx(75,.8,'sawtooth',.05);
  }
 },
 ending(){
  let el=$('ldxEnding');if(!el){el=document.createElement('div');el.id='ldxEnding';el.style.cssText='margin-top:10px;font:600 12px system-ui,sans-serif;letter-spacing:.3em;color:#e8c9a0;text-align:center';$('victoryText').after(el)}
  const r=game.relics.filter(Boolean).length,b=game.bosses.filter(Boolean).length;
  el.textContent=r===7&&b===7?this.id('PENAKLUK ABADI','ETERNAL CONQUEROR'):r===7?this.id('PENEMU 7 RELIK','KEEPER OF 7 RELICS'):b===7?this.id('PEMBURU 7 PENJAGA','SLAYER OF 7 GUARDIANS'):this.id('PENJELAJAH BERANI','BRAVE WANDERER');
  const cb=$('ldxContinue');if(cb)cb.textContent=this.id('LANJUT JELAJAH','KEEP EXPLORING');
 },
 init2(){
  const box=document.querySelector('#victoryOverlay .victory-buttons');
  if(box&&!$('ldxContinue')){const b=document.createElement('button');b.id='ldxContinue';b.type='button';b.addEventListener('click',()=>{$('victoryOverlay').hidden=true;game.missionEnd=false;game.postWin=true;finalVictory=false;start()});box.prepend(b)}
 }
});
ldx.init2();
