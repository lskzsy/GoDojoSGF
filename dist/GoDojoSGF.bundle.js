!function(t){var e={};function i(s){if(e[s])return e[s].exports;var n=e[s]={i:s,l:!1,exports:{}};return t[s].call(n.exports,n,n.exports,i),n.l=!0,n.exports}i.m=t,i.c=e,i.d=function(t,e,s){i.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:s})},i.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},i.t=function(t,e){if(1&e&&(t=i(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var s=Object.create(null);if(i.r(s),Object.defineProperty(s,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var n in t)i.d(s,n,function(e){return t[e]}.bind(null,n));return s},i.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return i.d(e,"a",e),e},i.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},i.p="",i(i.s=4)}([function(t,e){const i={typeIs:function(t,e){return t instanceof e}};t.exports=i},function(t,e){t.exports={BOARD:"board",CHESS:"chess",PROMPT:"prompt",MARK:"mark"}},function(t,e,i){const s=i(3),n=i(0),o=function(t,e,i,n,o=null){this.stone=new s(t,e,i,n),this.marks=o};o.prototype.addMark=function(t){null==this.marks&&(this.marks=[]),this.marks.push(t)},o.prototype.equal=function(t){return!!n.typeIs(t,o)&&(t.stone.x==this.stone.x&&t.stone.y==this.stone.y&&t.stone.color==this.stone.color&&t.stone.step==this.stone.step)},t.exports=o},function(t,e){t.exports=function(t,e,i,s){this.x=t,this.y=e,this.color=i,this.step=s}},function(t,e,i){const s=i(5),n=i(15);window.SGF=function(t){this.runtime=new n(t)},SGF.create=function(t){return new SGF(t)},SGF.prototype.right=function(){for(;this.runtime.player.continue(););},SGF.prototype.save=function(){return this.runtime.toString()},SGF.prototype.left=function(){for(;this.runtime.player.back(););},SGF.prototype.continue=function(){this.runtime.player.continue()},SGF.prototype.back=function(){this.runtime.player.back()},SGF.prototype.showOn=function(t,e){const i=document.getElementById(t);e.width=this.runtime.properties.x,e.height=this.runtime.properties.y;const n=new s(i,e);n.setOnClickListener(this._click.bind(this)),n.setOnRClickListener(this._rclick.bind(this)),this.runtime.setFront(n)},SGF.prototype.resize=function(t,e){this.runtime.hasFront()&&this.runtime.front.resize(t,e)},SGF.prototype._rclick=function(){this.runtime.recall()},SGF.prototype._click=function(t,e){const i=this.runtime.input.mode;/^mark(TR|CR|SQ|MA|LB)$/.test(i)?this.runtime.putMark(t,e,i.substr(4)):("w"!=i&&"b"!=i||(this.runtime.input.select=i),this.runtime.putStone({x:t,y:e,color:this.runtime.input.select}))},SGF.prototype.putStone=function(t,e){this._click(t,e)},SGF.prototype.delStone=function(t){},SGF.prototype.setInputMode=function(t){this.runtime.input.set(t)},SGF.prototype.hideCoordinate=function(){this.runtime.hasFront()&&this.runtime.front.hideCoordinate()},SGF.prototype.showCoordinate=function(){this.runtime.hasFront()&&this.runtime.front.showCoordinate()},SGF.prototype.hidePrompt=function(){this.runtime.hasFront()&&this.runtime.front.hidePrompt()},SGF.prototype.showPrompt=function(){this.runtime.hasFront()&&this.runtime.front.showPrompt()},SGF.prototype.showStep=function(){this.runtime.hasFront()&&this.runtime.front.showStep()},SGF.prototype.hideStep=function(){this.runtime.hasFront()&&this.runtime.front.hideStep()},SGF.prototype.onStoneCreated=function(t){this.runtime.onStoneCreated(t)},SGF.prototype.onStoneDeleted=function(t){this.runtime.onStoneDeleted(t)},SGF.prototype.onBranchMove=function(t){this.runtime.onBranchMove(t)},SGF.prototype.confirmPutStone=function(){this.runtime.hasFront()&&this.runtime.front.confirm()},SGF.prototype.quitPutStone=function(){this.runtime.hasFront()&&this.runtime.front.quit()},SGF.prototype.confirmMode=function(t,e=null){this.runtime.hasFront()&&this.runtime.front.confirmMode(t,e)}},function(t,e,i){const s=i(6),n=i(1),o=i(7),r=i(9),h=i(10),a=i(11),c=i(12),p=i(13),l=i(14),u=function(t,e={}){this.width=e.width||19,this.height=e.height||19,this.lineColor=e.lineColor||"black",this.background=e.background||"white",this.branchColor=e.branchColor||"blue",this.markColor=e.markColor||"red",this.styleWidth=e.styleWidth||0,this.styleHeight=e.styleHeight||0,this.position=e.position||"relative",this.dimension=new s(this.width,this.height,this.styleWidth,this.styleHeight),this.workspace=new o(this.dimension,this.position),this.workspace.register(n.BOARD,r,{lineColor:this.lineColor,background:this.background}),this.workspace.register(n.CHESS,h,{branchColor:this.branchColor,background:this.background}),this.workspace.register(n.PROMPT,a),this.workspace.register(n.MARK,c,{markColor:this.markColor}),this.workspace.belongTo(t),this.runtime={select:"b",onClickListener:null,onRClickListener:null,isPrompt:!0,isConfirm:!1},this._bind()};u.prototype._bind=function(){this.confirmHandle=new l(this),this.workspace.onClick(this._onclick.bind(this)),this.workspace.onRClick(this._onrclick.bind(this)),p.hook(this)},u.prototype._onrclick=function(t){t.preventDefault();const e=this._clickLoc(t);this.runtime.onRClickListener&&this.runtime.onRClickListener(e.x,e.y)},u.prototype._onclick=function(t){const e=this._clickLoc(t),i=this.runtime.onClickListener;i&&i(e.x,e.y)},u.prototype._clickLoc=function(t){const e=t.offsetX,i=t.offsetY,s=this.dimension.padding/2;let n=0,o=0;return{x:n=e<0&&e>-1*s?0:e>this.dimension.boardWidth+this.dimension.baseStart&&e<this.dimension.boardWidth+this.dimension.baseStart+s?this.dimension.x-1:parseInt((e-this.dimension.baseStart)/(this.dimension.padding+1)),y:o=i<0&&i>-1*s?0:i>this.dimension.boardHeight+this.dimension.baseStart&&i<this.dimension.boardHeight+this.dimension.baseStart+s?this.dimension.y-1:parseInt((i-this.dimension.baseStart)/(this.dimension.padding+1))}},u.prototype.putWhite=function(t,e,i){this.workspace.handle(n.CHESS,"putWhite",{x:t,y:e,step:i})},u.prototype.putBlack=function(t,e,i){this.workspace.handle(n.CHESS,"putBlack",{x:t,y:e,step:i})},u.prototype.putBranch=function(t,e,i){const s="A".charCodeAt()+i;this.workspace.handle(n.CHESS,"putBranch",{x:t,y:e,type:String.fromCharCode(s)})},u.prototype.putMark=function(t){let e=t.type;"LB"==t.type&&(e+=t.d),this.workspace.handle(n.MARK,"put",{x:t.x,y:t.y,type:e})},u.prototype.clearMark=function(t=-1,e=-1){this.workspace.handle(n.MARK,"delete",{x:t,y:e})},u.prototype.delete=function(t,e,i){this.workspace.handle(n.CHESS,"delete",{x:t,y:e,step:i})},u.prototype.setOnClickListener=function(t){this.runtime.onClickListener=t},u.prototype.removeOnClickListener=function(){this.runtime.onClickListener&&(this.runtime.onClickListener=null)},u.prototype.setOnRClickListener=function(t){this.runtime.onRClickListener=t},u.prototype.removeOnRClickListener=function(){this.runtime.onRClickListener&&(this.runtime.onRClickListener=null)},u.prototype.hideCoordinate=function(){this.workspace.coordinate(!1)},u.prototype.showCoordinate=function(){this.workspace.coordinate(!0)},u.prototype.hidePrompt=function(){this.workspace.handle(n.PROMPT,"show",!1),this.runtime.isPrompt=!1},u.prototype.showPrompt=function(){this.workspace.handle(n.PROMPT,"show",!0),this.runtime.isPrompt=!0,this.runtime.isConfirm=!1},u.prototype.confirmMode=function(t,e){this.runtime.isConfirm!=t&&(this.runtime.isConfirm=t,t?(this.runtime.isPrompt=!1,this.workspace.handle(n.PROMPT,"show",!0),this.confirmHandle.mount()):this.confirmHandle.dismount())},u.prototype.showStep=function(){this.workspace.handle(n.CHESS,"showStepView",!0)},u.prototype.hideStep=function(){this.workspace.handle(n.CHESS,"showStepView",!1)},u.prototype.resize=function(t,e){this.workspace.resize(t,e)},u.prototype.select=function(t){this.runtime.select=t},u.prototype.confirm=function(){this.workspace.handle(n.PROMPT,"clearConfirmView"),this.confirmHandle.confirm()},u.prototype.quit=function(){this.confirmHandle.quit()},t.exports=u},function(t,e){DEFAULT={MARGIN_BY_PADDING:.8};const i=function(t,e,i,s){this.x=t,this.y=e,this.width=i,this.height=s,this.margin=0,this.padding=0,this.marginByPadding=DEFAULT.MARGIN_BY_PADDING,this.boardWidth=0,this.boardHeight=0,this.baseStart=0,this.baseWidth=0,this.baseHeight=0,this.showCoord=!1,this.baseLine()};i.prototype.baseLine=function(){let t=this.width,e=this.x;this.width>this.height&&(t=this.height,e=this.y),this.padding=(t-e)/(e-1+2*this.marginByPadding+(this.showCoord?2:0)),this.margin=this.marginByPadding*this.padding,this.boardWidth=this.width-2*this.margin-(this.showCoord?2*this.padding:0)-1,this.boardHeight=this.height-2*this.margin-(this.showCoord?2*this.padding:0)-1,this.baseStart=this.showCoord?this.padding:0,this.baseWidth=this.width-(this.showCoord?2*this.padding:0),this.baseHeight=this.height-(this.showCoord?2*this.padding:0)},i.prototype.resize=function(t,e,i=0){this.width=t,this.height=e,i>0&&(this.marginByPadding=i),this.baseLine()},i.prototype.showCoordinate=function(t){t!=this.showCoord&&(this.showCoord=t,this.baseLine())},t.exports=i},function(t,e,i){const s=i(8),n=i(1),o=function(t,e="relative"){this.workspace=document.createElement("div"),this.dimension=t,this.layerManage={},this.isBuild=!1,this.showCoordinate=!1,this.workspace.style.position=e,this.workspace.style.margin="0",this.workspace.style.padding="0",this.nodes=[]};o.prototype.register=function(t,e={},i={}){const n=new s(this,t,e,i);this.layerManage[t]=n},o.prototype.belongTo=function(t){t.appendChild&&(t.appendChild(this.workspace),this.isBuild||(this.isBuild=!0,this.updateEdges(),this.updateNodes(),this.broadcast("build")))},o.prototype.resize=function(t,e){this.dimension.resize(t,e),this.updateEdges(),this.updateNodes(),this.broadcast("resize"),this.showCoordinate&&this.handle(n.BOARD,"coordinate")},o.prototype.broadcast=function(t,e={}){for(let i in this.layerManage){this.layerManage[i].call(t,e)}},o.prototype.coordinate=function(t){!this.showCoordinate&&t?(this.showCoordinate=!0,this.dimension.showCoordinate(!0),this.updateNodes(),this.broadcast("resize"),this.handle(n.BOARD,"coordinate")):this.showCoordinate&&!t&&(this.showCoordinate=!1,this.dimension.showCoordinate(!1),this.updateNodes(),this.broadcast("resize"))},o.prototype.updateEdges=function(){this.workspace.style.width=this.dimension.width+"px",this.workspace.style.height=this.dimension.height+"px";for(let t in this.layerManage){this.layerManage[t].sizeBy(this.dimension.width,this.dimension.height)}},o.prototype.handle=function(t,e,i={}){this.layerManage[t]&&this.layerManage[t].call(e,i)},o.prototype.updateNodes=function(){const t=[];for(let e=0,i=this.dimension.margin+this.dimension.baseStart;e<this.dimension.x;e++){const e=[];for(let t=0,s=this.dimension.margin+this.dimension.baseStart;t<this.dimension.y;t++)e.push({x:i,y:s}),s+=this.dimension.padding+1;i+=this.dimension.padding+1,t.push(e)}t.get=function(t,e){return t>=this.length||e>=this[t].length?{x:-1,y:-1}:this[t][e]},this.nodes=t},o.prototype.appendChild=function(t){this.workspace.appendChild(t)},o.prototype.onClick=function(t){this.workspace.onclick=t},o.prototype.onRClick=function(t){this.workspace.oncontextmenu=t},t.exports=o},function(t,e){const i=function(t,e,i,s){this.canvas=document.createElement("canvas"),this.workspace=t,this.name=e,this.mapper={},this.config=s;for(let t in i)this.mapper[t]=i[t].bind(this);this.canvas.style.position="absolute",t.appendChild(this.canvas)};i.prototype.call=function(t,e={}){return this.mapper[t]?this.mapper[t](e):null},i.prototype.sizeBy=function(t,e){this.canvas.width=t,this.canvas.height=e,this.canvas.style.width=t+"px",this.canvas.style.height=e+"px"},t.exports=i},function(t,e){t.exports={build:function(){this.call("paint")},resize:function(){this.call("paint")},paint:function(){const t=this.canvas.getContext("2d"),e=this.workspace.dimension,i=this.workspace.nodes;t.clearRect(0,0,this.canvas.width,this.canvas.height),t.beginPath(),t.fillStyle=this.config.background,t.rect(e.baseStart,e.baseStart,e.baseWidth,e.baseHeight),t.fill(),t.closePath(),t.strokeStyle=this.config.lineColor;for(let i=0,s=e.margin+e.baseStart,n=e.margin+e.baseStart;i<e.y;i++)t.beginPath(),t.moveTo(s,n),t.lineTo(s,n+e.boardHeight),t.closePath(),t.stroke(),s+=e.padding+1;for(let i=0,s=e.margin+e.baseStart,n=e.margin+e.baseStart;i<e.x;i++)t.beginPath(),t.moveTo(s,n),t.lineTo(s+e.boardWidth,n),t.closePath(),t.stroke(),n+=e.padding+1;t.fillStyle=this.config.lineColor;const s=function(e){t.beginPath(),t.arc(e.x,e.y,3.5,0,2*Math.PI),t.closePath(),t.fill()};let n=[],o=[];e.x>6&&e.x<10?n=[2,e.x-3]:e.x>9&&e.x<15||!(e.x%2)?n=[3,e.x-4]:e.x>14&&(n=[3,parseInt(e.x/2),e.x-4]),e.y>6&&e.y<10?o=[2,e.y-3]:e.y>9&&e.y<15||!(e.y%2)?o=[3,e.y-4]:e.y>14&&(o=[3,parseInt(e.y/2),e.y-4]);for(let t=0;t<n.length;t++)for(let e=0;e<o.length;e++)s(i.get(n[t],o[e]));13==e.x&&13==e.y&&s(i.get(6,6))},coordinate:function(){const t=this.canvas.getContext("2d"),e=this.workspace.dimension,i=this.workspace.nodes;t.font=`${parseInt(e.padding/2)-1}px bold Apercu`,t.textAlign="center",t.textBaseline="middle";for(let s=0,n="A";s<e.x;s++){if("I"==n)s--;else{const o=i.get(s,0);t.fillText(n,o.x,2*e.padding/3,e.padding-2),t.fillText(n,o.x,e.height-2*e.padding/3,e.padding-2)}n=String.fromCharCode(n.charCodeAt()+1)}for(let s=0;s<e.y;s++){const n=i.get(0,s);t.fillText(s+1,2*e.padding/3,n.y,e.padding-2),t.fillText(s+1,e.width-2*e.padding/3,n.y,e.padding-2)}}}},function(t,e){t.exports={build:function(){this.stones={},this.branchMarks={},this.current=null,this.showStep=!1,this.maxStep=0},resize:function(){this.canvas.getContext("2d").clearRect(0,0,this.canvas.width,this.canvas.height);for(let t in this.stones)this.call("putStone",this.stones[t]);for(let t in this.branchMarks)this.call("putBranch",this.branchMarks[t])},putWhite:function(t){t.isBlack=!1,this.call("putStone",t)},putBlack:function(t){t.isBlack=!0,this.call("putStone",t)},putStone:function(t){this.call("drawStone",t),this.current&&!t.isHistory&&this.call("updateMaxStep",t.step)&&(this.current.isHistory=!0,t.last=this.current,this.call("clear",this.current),this.call("drawStone",this.current)),this.current=t,this.stones[`${t.x}:${t.y}`]=t},delete:function(t){this.call("clear",t);const e=`${t.x}:${t.y}`;this.stones[e]&&(this.stones[e].last&&t.step==this.maxStep&&(this.current=this.stones[e].last,this.current.isHistory=!1,this.maxStep--,this.call("clear",this.current),this.call("drawStone",this.current)),delete this.stones[e]),this.branchMarks[e]&&delete this.branchMarks[e]},drawStone:function(t){const e=this.canvas.getContext("2d"),i=this.workspace.dimension,s=this.workspace.nodes.get(t.x,t.y);e.fillStyle=t.isBlack?"#000":"#fff",e.strokeStyle=this.config.lineColor,e.lineWidth=1.5,e.beginPath(),e.arc(s.x,s.y,i.padding/2-1,0,2*Math.PI),e.closePath(),e.fill(),e.stroke(),null==t.isHistory&&(t.isHistory=!1);let n=!1;!t.isHistory&&t.step>=this.maxStep?(e.fillStyle="red",n=!0):(e.fillStyle=t.isBlack?"#fff":"#000",n=this.showStep),n&&(e.font=`${parseInt(i.padding/2)-1}px bolder Kaiti`,e.textAlign="center",e.textBaseline="middle",e.fillText(`${t.step}`,s.x,s.y+1,i.padding-2))},putBranch:function(t){const e=this.canvas.getContext("2d"),i=this.workspace.dimension,s=this.workspace.nodes.get(t.x,t.y);e.fillStyle=this.config.background,e.beginPath(),e.arc(s.x,s.y,i.padding/3,0,2*Math.PI),e.closePath(),e.fill(),e.font=`${parseInt(i.padding/2)-1}px bold Apercu`,e.textAlign="center",e.textBaseline="middle",e.fillStyle=this.config.branchColor,e.fillText(t.type,s.x,s.y,i.padding-2),this.branchMarks[`${t.x}:${t.y}`]=t},clear:function(t){const e=this.canvas.getContext("2d"),i=this.workspace.dimension,s=this.workspace.nodes.get(t.x,t.y),n=i.padding/2;e.clearRect(s.x-n,s.y-n,i.padding,i.padding)},showStepView:function(t){t!=this.showStep&&(this.showStep=t,this.call("resize"))},updateMaxStep:function(t){return this.maxStep<t&&(this.maxStep=t,!0)}}},function(t,e){t.exports={build:function(){this.confirmParams=null},resize:function(){this.confirmParams&&this.call("confirmView",this.confirmParams)},put:function(t){switch(t.select){case"w":case"b":this.call("stone",t);break;default:this.call("mark",t)}},stone:function(t){const e=this.canvas.getContext("2d"),i=this.workspace.dimension,s=this.workspace.nodes.get(t.x,t.y);e.fillStyle="b"==t.select?"#00000055":"#ffffffdd",e.strokeStyle=this.config.lineColor,e.lineWidth=1.5,e.beginPath(),e.arc(s.x,s.y,i.padding/2-1,0,2*Math.PI),e.closePath(),e.fill(),e.stroke()},mark:function(t){const e=this.canvas.getContext("2d"),i=this.workspace.dimension,s=this.workspace.nodes.get(t.x,t.y);let n=i.padding/5;if(e.fillStyle="#ffffffdd",e.strokeStyle=this.config.markColor,e.lineWidth=1,e.beginPath(),"CR"==t.select)e.arc(s.x,s.y,n,0,2*Math.PI);else if("TR"==t.select){const t=(n=i.padding/4)/2,o=n*Math.sqrt(3)/2;e.moveTo(s.x-o,s.y+t),e.lineTo(s.x,s.y-n),e.lineTo(s.x+o,s.y+t)}else if("SQ"==t.select)e.rect(s.x-n,s.y-n,2*n,2*n);else if("MA"==t.select){const t=n;e.lineWidth=2,e.moveTo(s.x-t,s.y-t),e.lineTo(s.x+t,s.y+t),e.moveTo(s.x+t,s.y-t),e.lineTo(s.x-t,s.y+t)}else/^LB[A-Z]?$/.test(t.select)&&(e.font=`${parseInt(2*i.padding/3)-1}px bold Apercu`,e.textAlign="center",e.textBaseline="middle",e.fillText(3==t.select.length?t.select[2]:"A",s.x,s.y,i.padding-2));e.closePath(),e.fill(),e.stroke()},delete:function(t){const e=this.canvas.getContext("2d"),i=this.workspace.dimension,s=this.workspace.nodes.get(t.x,t.y),n=i.padding/2;e.clearRect(s.x-n,s.y-n,i.padding,i.padding)},show:function(t){this.canvas.style.display=t?"":"none"},confirmView:function(t){this.call("clearConfirmView"),this.call("stone",t),this.confirmParams=t},clearConfirmView:function(){this.canvas.getContext("2d").clearRect(0,0,this.canvas.width,this.canvas.height),this.confirmParams=null}}},function(t,e){t.exports={build:function(){this.marks={}},resize:function(){this.canvas.getContext("2d").clearRect(0,0,this.canvas.width,this.canvas.height);for(let t in this.marks)this.call("put",this.marks[t])},put:function(t){const e=this.canvas.getContext("2d"),i=this.workspace.dimension,s=this.workspace.nodes.get(t.x,t.y);let n=i.padding/5;if(e.fillStyle=this.config.markColor,e.strokeStyle=this.config.markColor,e.lineWidth=1,e.beginPath(),"CR"==t.type)e.arc(s.x,s.y,n,0,2*Math.PI);else if("TR"==t.type){const t=(n=i.padding/4)/2,o=n*Math.sqrt(3)/2;e.moveTo(s.x-o,s.y+t),e.lineTo(s.x,s.y-n),e.lineTo(s.x+o,s.y+t)}else if("SQ"==t.type)e.rect(s.x-n,s.y-n,2*n,2*n);else if("MA"==t.type){const t=n;e.lineWidth=2,e.moveTo(s.x-t,s.y-t),e.lineTo(s.x+t,s.y+t),e.moveTo(s.x+t,s.y-t),e.lineTo(s.x-t,s.y+t)}else/^LB[A-Z]?$/.test(t.type)&&(e.font=`${parseInt(2*i.padding/3)-1}px bold Apercu`,e.textAlign="center",e.textBaseline="middle",e.fillText(3==t.type.length?t.type[2]:"A",s.x,s.y,i.padding-2));e.closePath(),e.fill(),e.stroke(),this.marks[`${t.x}:${t.y}`]=t},delete:function(t){const e=this.canvas.getContext("2d"),i=this.workspace.dimension,s=this.workspace.nodes;if(t.x>=0&&t.y>=0){const n=s.get(t.x,t.y),o=i.padding/2;e.clearRect(n.x-o,n.y-o,i.padding,i.padding);const r=`${t.x}:${t.y}`;this.marks[r]&&delete this.marks[r]}else e.clearRect(0,0,this.canvas.width,this.canvas.height),this.marks={}}}},function(t,e,i){const s=i(1),n=function(t){this.promptX=-1,this.promptY=-1,this.workspace=t.workspace,this.runtime=t.runtime,this.board=t,this.workspace.workspace.onmousemove=this.onMouseMove.bind(this),this.workspace.workspace.onmouseleave=this.onMouseLeave.bind(this)};n.prototype.onMouseMove=function(t){if(this.runtime.isPrompt){const e=this.board._clickLoc(t);e.x==this.promptX&&e.y==this.promptY||(-1!=this.promptX&&-1!=this.promptY&&this.workspace.handle(s.PROMPT,"delete",{x:this.promptX,y:this.promptY}),this.promptX=e.x,this.promptY=e.y,-1!=this.promptX&&-1!=this.promptY&&this.workspace.handle(s.PROMPT,"put",{x:this.promptX,y:this.promptY,select:this.runtime.select}))}},n.prototype.onMouseLeave=function(t){this.runtime.isPrompt&&-1!=this.promptX&&-1!=this.promptY&&this.workspace.handle(s.PROMPT,"delete",{x:this.promptX,y:this.promptY})},n.hook=function(t){new n(t)},t.exports=n},function(t,e,i){const s=i(1),n=function(t){this.board=t,this.runtime=t.runtime,this.workspace=t.workspace,this.realListener=t._onclick.bind(t),this.callback=null,this.waitConfirmEvent=null};n.prototype.bindCallback=function(t){this.callback=t},n.prototype.mount=function(){this.workspace.onClick(this.handle.bind(this))},n.prototype.handle=function(t){const e=this.board._clickLoc(t);this.waitConfirmEvent=e,this.workspace.handle(s.PROMPT,"confirmView",{x:e.x,y:e.y,select:this.runtime.select}),this.callback&&this.callback()},n.prototype.confirm=function(){if(this.runtime.isConfirm&&this.waitConfirmEvent){const t=this.runtime.onClickListener;t&&t(this.waitConfirmEvent.x,this.waitConfirmEvent.y),this.waitConfirmEvent=null,this.workspace.handle(s.PROMPT,"clearConfirmView")}},n.prototype.quit=function(){this.runtime.isConfirm&&this.waitConfirmEvent&&(this.waitConfirmEvent=null,this.workspace.handle(s.PROMPT,"clearConfirmView"))},n.prototype.dismount=function(){this.workspace.onClick(this.realListener)},t.exports=n},function(t,e,i){const s=i(16),n=i(17),o=i(18),r=i(19),h=i(2),a=i(20),c=i(21),p=i(0),l=function(t={}){if(this.board=new o,this.front=null,this.properties={x:t.x||19,y:t.y||19,isKo:t.isKo||!1,encoding:t.encoding||"UTF-8",boardSize:(t.boardSize||"19")+"",application:t.application||"GoDojoSGF:20200126",fileFormat:t.fileFormat||1,gameMode:t.gameMode||1,initData:t.data||!1},this.properties.boardSize.indexOf(":")>-1){const t=this.properties.boardSize.split(":");this.properties.x=parseInt(t[0]),this.properties.y=parseInt(t[1])}else this.properties.x=this.properties.y=parseInt(this.properties.boardSize);this.handlers={onStoneCreated:null,onStoneDeleted:null,onBranchMove:null},this.branch=new r,this.player=new n(this.properties,this.board,this.branch),this.goRule=new s(this.board,this.properties.isKo),this.convertor=new a,this.input=new c,this.build()};l.prototype.build=function(){this.board.build(this.properties),this.board.setRule(this.goRule),this.board.setInput(this.input),this.properties.initData&&this.initBySGFString(this.properties.initData)},l.prototype.initBySGFString=function(t){const e=this.convertor.do(t);if(e){const t=e.root;t.application&&(this.properties.application=t.application),t.boardSize&&(this.properties.boardSize=t.boardSize),t.width&&(this.properties.x=t.width),t.height&&(this.properties.y=t.height),t.encoding&&(this.properties.encoding=t.encoding),t.fileFormat&&(this.properties.fileFormat=t.fileFormat),t.gameMode&&(this.properties.gameMode=t.gameMode),this.branch.init(e.data)}},l.prototype.reset=function(){},l.prototype.toString=function(){return this.convertor.to(this)},l.prototype.updateBySGFString=function(t){this.reset(),this.initBySGFString(t)},l.prototype.recall=function(){if(this.player.step>0&&!this.branch.get(this.player.next())){const t=this.branch.get(this.player.getRoute());if(p.typeIs(t,h))if(t.marks&&t.marks.length>0){const e=t.marks.splice(t.marks.length-1);this.hasFront()&&this.front.clearMark(e[0].x,e[0].y)}else{const e=this.player.getRoute();this.player.back(),this.branch.delete(e),this.player.clearBranchMark(),this.player.showBranchMark(),this.handlers.onStoneDeleted&&this.handlers.onStoneDeleted(e,t)}}},l.prototype.putMark=function(t,e,i){const s={x:t,y:e,type:i},n=this.branch.get(this.player.getRoute());if(p.typeIs(n,h)){if("LB"==i){let t=0;null!=n.marks&&n.marks.forEach(e=>{"LB"==e.type&&t++}),s.d=String.fromCharCode("A".charCodeAt()+t)}this.hasFront()&&this.front.putMark(s),n.addMark(s)}this.player.hasMark=!0},l.prototype.putStone=function(t){const e=new h(t.x,t.y,t.color,this.player.step+1);if(this.board.pass(t.x,t.y)&&!this.goRule.isAsphyxiating(e.stone)){let t=!1,i=!1;const s=this.player.next(),n=this.branch.get(s);if(p.typeIs(n,h))if(n.equal(e))this.player.continue();else{const n=this.branch.divide(s,e);!1!==n&&(this.player.checkout(n),t=!0,i=!0)}else if(p.typeIs(n,Array)){const n=s[s.length-1],o=this.branch.find(s,e,n);if(!1===o){const n=this.branch.divide(s,e);!1!==n&&(this.player.checkout(n),t=!0,i=!0)}else this.player.checkout(o),i=!0}else this.branch.insert(this.player.getRoute(),e),this.player.continue(),t=!0;t&&this.handlers.onStoneCreated&&this.handlers.onStoneCreated(this.player.route,e),i&&this.handlers.onBranchMove&&this.handlers.onBranchMove()}},l.prototype.setFront=function(t){this.front=t,this.board.setFront(t),this.input.setFront(t)},l.prototype.hasFront=function(){return null!=this.front},l.prototype.onStoneCreated=function(t){this.handlers.onStoneCreated=t},l.prototype.onStoneDeleted=function(t){this.handlers.onStoneDeleted=t},l.prototype.onBranchMove=function(t){this.handlers.onBranchMove=t},t.exports=l},function(t,e){const i=function(t,e){this.vboard=t,this.isKo=e,this.lastKill=null,this.lastPut=null,this.deathStones=[]};i.prototype.isAsphyxiating=function(t){this.vboard.data[t.x][t.y]=t,this._clearDead(t),this.deathStones.forEach(t=>this.vboard.data[t.x][t.y]=!1);const e=this._searchBreath(t);return e&&(this.lastPut={x:t.x,y:t.y}),this.deathStones.forEach(t=>this.vboard.data[t.x][t.y]=t),this.vboard.data[t.x][t.y]=!1,!e},i.prototype.getDeathStones=function(){return this.deathStones},i.prototype._clearDead=function(t){const e=[0,1,0,-1],i=[1,0,-1,0];this.deathStones=[];let s=[];for(let n=0;n<4;n++){const o=t.x+e[n],r=t.y+i[n];if(this.vboard.refuse(o,r,t.color)){const t=[];this._searchBreath(this.vboard.data[o][r],t)||(s=s.concat(t))}}if(s.length>0){let e=!1;null!=this.lastPut&&null!=this.lastKill&&1==s.length&&(e=s[0].x==this.lastPut.x&&s[0].y==this.lastPut.y&&t.x==this.lastKill.x&&t.y==this.lastKill.y),this.isKo&&e||(this.lastKill=1==s.length?s[0]:null,this.deathStones=s)}},i.prototype._searchBreath=function(t,e=[]){const i=[0,1,0,-1],s=[1,0,-1,0],n=[],o={};for(n.push(t),o[`${t.x}:${t.y}`]=!0,e.push(t);n.length>0;){const r=n.splice(0,1)[0];for(let h=0;h<4;h++){const a=r.x+i[h],c=r.y+s[h];if(!o[`${a}:${c}`]&&this.vboard.in(a,c)){o[`${a}:${c}`]=!0;const i=this.vboard.data[a][c];if(!1===i)return!0;i.color==t.color&&(n.push(i),e.push(i))}}}return!1},t.exports=i},function(t,e,i){const s=i(0),n=i(2),o=function(t,e,i){this.properties=t,this.vboard=e,this.branch=i,this.step=0,this.route=[-1],this.branchMark=[],this.hasMark=!1};o.prototype.showBranchMark=function(){const t=this.branch.getBranch(this.route);let e=0;t.forEach(t=>{this.vboard.hasFront()&&this.vboard.front.putBranch(t.stone.x,t.stone.y,e++),this.branchMark.push({x:t.stone.x,y:t.stone.y})})},o.prototype.clearBranchMark=function(){this.branchMark.length>0&&(this.vboard.hasFront()&&this.branchMark.forEach(t=>this.vboard.front.delete(t.x,t.y)),this.branchMark=[])},o.prototype.showMark=function(){const t=this.branch.get(this.route);s.typeIs(t,n)&&t.marks&&this.vboard.hasFront()&&(this.hasMark=!0,t.marks.forEach(t=>this.vboard.front.putMark(t)))},o.prototype.clearMark=function(){this.hasMark&&(this.vboard.hasFront()&&this.vboard.front.clearMark(),this.hasMark=!1)},o.prototype.next=function(){const t=this.route.slice();return t[t.length-1]++,t},o.prototype.getRoute=function(){return this.route.slice()},o.prototype.continue=function(t=1){for(let e=0;e<t;e++){this.step++,this.route[this.route.length-1]++;const t=this.branch.get(this.route);if(!s.typeIs(t,n))return this.step--,this.route[this.route.length-1]--,!1;{this.clearBranchMark(),this.clearMark(),this.vboard.put(t.stone),this.showMark();const e=this.branch.get(this.next());if(s.typeIs(e,Array))return this.showBranchMark(),!1}}return!0},o.prototype.back=function(t=1){for(let e=0;e<t;e++){if(0==this.step)return!1;const t=this.branch.get(this.route);s.typeIs(t,n)&&(this.clearBranchMark(),this.clearMark(),this.vboard.delete(t.stone),this.vboard.input.setColor(t.stone.color)),this.step--,this.route[this.route.length-1]--,this.showMark(),this.route[this.route.length-1]<0&&this.route.length>1&&(this.route.pop(),this.route[this.route.length-1]=this.branch.getLastStepIndex(this.route),this.showBranchMark()),s.typeIs(t,n)&&this.vboard.backLife(t.stone)}return!0},o.prototype.checkout=function(t){this.route[this.route.length-1]=t,this.route.push(-1),this.continue()},o.prototype.setFront=function(t){this.front=t},o.prototype.hasFront=function(){return null!=this.front},t.exports=o},function(t,e,i){const s=i(3),n=i(0),o=function(){this.data=[],this.x=19,this.y=19,this.front=null,this.rule=null,this.input=null,this.deathStones=[]};o.prototype.setFront=function(t){this.front=t},o.prototype.hasFront=function(){return null!=this.front},o.prototype.setRule=function(t){this.rule=t},o.prototype.hasRule=function(){return null!=this.rule},o.prototype.setInput=function(t){this.input=t},o.prototype.hasInput=function(){return null!=this.input},o.prototype.build=function(t){for(let e=0;e<t.x;e++){const e=[];for(let i=0;i<t.y;i++)e.push(!1);this.data.push(e)}this.x=t.x,this.y=t.y},o.prototype.pass=function(t,e){return this.in(t,e)&&!n.typeIs(this.data[t][e],s)},o.prototype.refuse=function(t,e,i){return!!this.in(t,e)&&(n.typeIs(this.data[t][e],s)&&this.data[t][e].color!=i)},o.prototype.backLife=function(t){const e=this.deathStones[t.step];e&&(e.forEach(t=>this.put(t)),this.deathStones[t.step]=!1)},o.prototype.put=function(t){if(n.typeIs(t,s)&&this.pass(t.x,t.y)){if(this.hasRule()&&this.rule.isAsphyxiating(t))return!1;{this.data[t.x][t.y]=t,this.hasFront()&&("w"==t.color?this.front.putWhite(t.x,t.y,t.step):this.front.putBlack(t.x,t.y,t.step));const e=this.rule.getDeathStones();return e.length>0&&(e.forEach(t=>this.delete(t)),this.deathStones[t.step]=e),this.hasInput()&&this.input.repeat(t.color),!0}}return!1},o.prototype.delete=function(t){return!!this.in(t.x,t.y)&&(this.data[t.x][t.y]=!1,this.hasFront()&&this.front.delete(t.x,t.y,t.step),!0)},o.prototype.in=function(t,e){return t>=0&&t<this.x&&e>=0&&e<this.y},t.exports=o},function(t,e,i){const s=i(0),n=i(2),o=function(){this.data=[]};o.prototype.init=function(t){this.data=t},o.prototype.reset=function(){this.data=[]},o.prototype.get=function(t){if(s.typeIs(t,Array)&&t.length>0){let e=this.data;for(let i=0;i<t.length-1;i++){if(!(e.length>t[i]&&s.typeIs(e[t[i]],Array)))return!1;e=e[t[i]]}return e.length>t[t.length-1]&&e[t[t.length-1]]}return!1},o.prototype._execute=function(t,e){if(s.typeIs(t,Array)&&t.length>0){const i=t.splice(0,t.length-1);let n=this.data;return i.length>0&&(n=this.get(i)),!(!s.typeIs(n,Array)||!(0==t[0]||n.length>t[0]))&&e(n,t[0])}return!1},o.prototype.getLastStepIndex=function(t){return this._execute(t,(t,e)=>{for(let e=t.length-1;e>=0;e--)if(s.typeIs(t[e],n))return e})},o.prototype.getBranch=function(t){return this._execute(t,(t,e)=>{const i=[];return t.forEach(t=>s.typeIs(t,Array)&&i.push(t[0])),i})},o.prototype.insert=function(t,e){return!!s.typeIs(e,n)&&this._execute(t,(t,i)=>(s.typeIs(t[i],Array)?t[i].push(e):t.splice(i+1,0,e),!0))},o.prototype.delete=function(t){let e=t.slice();return this._execute(t,(i,o)=>{if(s.typeIs(i[o],Array)){if(i.splice(o,1),i.length-2>=0&&s.typeIs(i[i.length-2],n)&&s.typeIs(i[i.length-1],Array)){i.splice(i.length-1)[0].forEach(t=>i.push(t))}}else 0==o?(t=e.slice(0,e.length-1),this.delete(t)):i.splice(o)})},o.prototype.divide=function(t,e){return!!s.typeIs(e,n)&&this._execute(t,(t,i)=>(s.typeIs(t[i],Array)||t.push(t.splice(i)),t.push([e]),t.length-1))},o.prototype.find=function(t,e,i=0){return!!s.typeIs(e,n)&&this._execute(t,(t,o)=>{for(let o=i;o<t.length;o++){const i=t[o];if(s.typeIs(i,n)&&i.equal(e))return o;if(s.typeIs(i,Array)&&i.length>0&&i[0].equal(e))return o}return!1})},t.exports=o},function(t,e,i){const s=i(2),n=function(){this.symbolMap=null,this.step=0};n.prototype.do=function(t){const e=t.replace(/\n/g,""),i={};if("("==e[0]){if(this.symbolMap=this._scan(e),this.step=0,this.symbolMap){const t=this._parse(e,0,this.symbolMap[0]);return i.root=this._parseRoot(t[0]),i.data=this._convert(t.slice(1)),i}return!1}return!1},n.prototype.to=function(t){const e=this._toString(t.branch.data);return`(;CA[${t.properties.encoding}]SZ[${t.properties.boardSize}]AP[${t.properties.application}]${e})`},n.prototype._toString=function(t){const e="a".charCodeAt();let i="";return t.forEach(t=>{if(t instanceof Array)i+=`(${this._toString(t)})`;else{const s=t.stone;if(i+=`;${s.color.toUpperCase()}[${String.fromCharCode(e+s.x)}${String.fromCharCode(e+s.y)}]`,t.marks&&t.marks.length>0){const s={};t.marks.forEach(t=>{s[t.type]||(s[t.type]=[]),s[t.type].push(t)});for(let t in s){const n=s[t];i+=t,n.forEach(t=>{"LB"==t.type?i+=`[${String.fromCharCode(e+t.x)}${String.fromCharCode(e+t.y)}:${t.d}]`:i+=`[${String.fromCharCode(e+t.x)}${String.fromCharCode(e+t.y)}]`})}}}}),i},n.prototype._scan=function(t){const e={},i=[];let s=0;for(let n=0;n<t.length;n++)switch(t[n]){case"(":i[s++]=n;break;case")":e[i[--s]]=n}return s?null:e},n.prototype._convert=function(t){const e=[],i="a".charCodeAt();let n=0;for(let o=0;o<t.length;o++)if("object"==typeof t[o])e.push(this._convert(t[o]));else{const r=/^(W|B)\[(\w)(\w)\](.*?)$/.exec($.trim(t[o]));if(r){this.step++,n++;const t=new s(r[2].charCodeAt()-i,r[3].charCodeAt()-i,r[1].toLocaleLowerCase(),this.step);if(r[4].length>0){r[4].match(/(TR|SQ|MA|CR)(\[\w\w\])+/g).forEach(e=>{const s=/^(TR|SQ|MA|CR)(.*?)$/.exec(e);if(s){s[2].match(/\[\w\w\]/g).forEach(e=>t.addMark({type:s[1],x:e[1].charCodeAt()-i,y:e[2].charCodeAt()-i}))}});const e=/LB((\[\w\w:[A-Z]\])+)/.exec(r[4]);if(e){e[1].match(/\[\w\w:[A-Z]\]/g).forEach(e=>t.addMark({type:"LB",x:e[1].charCodeAt()-i,y:e[2].charCodeAt()-i,d:e[4]}))}}e.push(t)}}return this.step-=n,e},n.prototype._parse=function(t,e,i){const s=[];let n=e+1,o=t.indexOf("(",n);for((o>i||-1==o)&&(o=i),t.substring(n,o).split(";").forEach(t=>{t.length>0&&s.push(t)}),n=o;n<i&&-1!=n;){let e=this.symbolMap[n];s.push(this._parse(t,n,e)),n=t.indexOf("(",e)}return s},n.prototype._parseRoot=function(t){const e={};if((AP=/AP\[(.*?)\]/.exec(t))&&(e.application=AP[1]),(CA=/CA\[(.*?)\]/.exec(t))&&(e.encoding=CA[1]),(GM=/GM\[(\d+)\]/.exec(t))&&(e.gameMode=parseInt(GM[1])),(FF=/FF\[([1-4])\]/.exec(t))&&(e.fileFormat=parseInt(FF[1])),SZ=/SZ\[(\d+|\d+:\d+)\]/.exec(t))if(e.boardSize=SZ[1],e.width=0,e.height=0,e.boardSize.indexOf(":")>-1){const t=e.boardSize.split(":");e.width=t[0],e.height=t[1]}else e.width=e.height=parseInt(e.boardSize);return e},t.exports=n},function(t,e){const i=function(){this.mode="repeat",this.select="b",this.front=null};i.prototype.set=function(t){this.mode=t,"w"==t||"b"==t?(this.select=t,this.hasFront()&&this.front.select(t)):/^mark(TR|CR|SQ|MA|LB)$/.test(t)?this.hasFront()&&this.front.select(t.substr(4)):"repeat"==t&&this.front.select(this.select)},i.prototype.setColor=function(t){this.select=t,this.front.select(this.select)},i.prototype.repeat=function(t){"repeat"==this.mode&&("w"==t?(this.select="b",this.hasFront()&&this.front.select("b")):(this.select="w",this.hasFront()&&this.front.select("w")))},i.prototype.setFront=function(t){this.front=t},i.prototype.hasFront=function(){return null!=this.front},t.exports=i}]);