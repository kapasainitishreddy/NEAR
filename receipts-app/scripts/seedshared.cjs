/* Shared demo-data seeder for screenshot/video tooling. */
const now = Date.now()
const iso = (d=0,h)=>{const x=new Date(now+d*86400000); if(h!=null)x.setHours(h,0,0,0); return x.toISOString()}
const decisions=[
 {id:'d1',type:'decision',title:'Take the job in Lisbon',category:'Career',status:'sent',favorite:true,finalDecision:'Accept the Lisbon offer and relocate this autumn.',optionsConsidered:'Stay in Berlin · Take Lisbon · Keep looking',mainReason:'The role is the growth leap I have wanted for years.',pros:'Bigger scope\nSunshine and the sea\nHigher pay',cons:'Leaving close friends\nNew language to learn',risks:'The team could reorganise within a year.',evidence:'Glassdoor reviews are strong; I met four future teammates.',feelings:'excited but a little anxious',influencedBy:'my partner and an old mentor',changeMind:'If the visa fell through or the team lead left.',premortem:'Six months in it failed because I underestimated how isolating a new city can be.',futureMeNote:'Remember you chose courage over comfort. Be patient with the lonely weeks.',reversibility:'irreversible',valuesHonored:['Growth','Adventure'],valuesCost:['Security','Family'],decideBy:iso(5),reviewDate:iso(40),sealNote:true,matrix:{options:['Lisbon','Stay in Berlin'],criteria:[{name:'Growth',weight:5},{name:'Cost of living',weight:3},{name:'Friends nearby',weight:4}],scores:{o0c0:5,o0c1:2,o0c2:2,o1c0:2,o1c1:4,o1c2:5}},history:[{at:iso(-2),text:'Accept the Lisbon offer.\nThe role is a growth leap.\nBigger scope'}],createdAt:iso(-1,21),updatedAt:iso(0)},
 {id:'d2',type:'decision',title:'Bought the expensive camera at midnight',category:'Purchases',status:'reviewed',finalDecision:'Bought the flagship camera on impulse.',mainReason:'I told myself it would make me shoot more.',feelings:'anxious and a bit guilty',influencedBy:'a late-night YouTube review',outcome:'regret',outcomeNote:'Barely used it.',createdAt:iso(-9,23),updatedAt:iso(-8),reviewDate:iso(-1)},
 {id:'d3',type:'decision',title:'Said no to the weekend project',category:'Career',status:'resolved',finalDecision:'Politely declined the extra weekend work.',mainReason:'Protecting rest is protecting my best work.',pros:'Rest\nBoundaries',cons:'Might disappoint my manager',feelings:'calm and clear',outcome:'relief',outcomeNote:'Monday-me was grateful.',createdAt:iso(-6,9),updatedAt:iso(-6)},
 {id:'d4',type:'decision',title:'Started therapy',category:'Health',status:'resolved',finalDecision:'Booked a first session and kept going.',mainReason:'I kept avoiding the thing that mattered most.',feelings:'hopeful and proud',outcome:'relief',outcomeNote:'One of my best calls.',createdAt:iso(-20,10),updatedAt:iso(-20)},
 {id:'d5',type:'decision',title:'Lent money to a friend',category:'Money',status:'followup',finalDecision:'Lent the money, no formal terms.',mainReason:'They needed help and I could afford it.',feelings:'uncertain',influencedBy:'guilt, honestly',outcome:'mixed',outcomeNote:'Still figuring out how it changed things.',createdAt:iso(-3,22),updatedAt:iso(-3)},
]
const scripts=[
 {id:'s1',type:'script',title:'Asking my professor for an extension',categoryId:'extension',tone:'professional',status:'draft',favorite:true,inputs:{recipient:'Professor Lin',context:'an extension on the essay',detail:'',name:'Sam'},content:'Dear Professor Lin,\n\nI’m writing to ask whether a short extension on the essay might be possible. I’ve had an unusually difficult week, and I want to submit work I’m proud of rather than rush it.\n\nWould two extra days be acceptable? Thank you for considering it.\n\nWarmly,\nSam',branches:[{trigger:'If they push back',reply:'I completely understand. Even one extra day would help me submit my best work.'},{trigger:'If they agree',reply:'Thank you so much — I really appreciate your flexibility.'},{trigger:'If they get defensive',reply:'I’m sorry for the late notice. I take responsibility and just want to do this properly.'}],createdAt:iso(-2),updatedAt:iso(-2)},
 {id:'s2',type:'script',title:'Setting a boundary with a friend',categoryId:'boundary',tone:'soft',status:'sent',inputs:{recipient:'Alex',context:'needing space',detail:'',name:''},content:'Hey Alex — I care about you, and I need to be honest. I’ve been feeling stretched thin and need a little more space for a while. It’s not about you; it’s about me catching my breath. Thank you for understanding.',createdAt:iso(-5),updatedAt:iso(-5)},
]
const rules=[
 {id:'r1',type:'rule',text:'Do not reply when angry.',note:'Sleep on it; the morning version is always kinder.',createdAt:iso(-15),updatedAt:iso(-15)},
 {id:'r2',type:'rule',text:'Sleep on big purchases for 24 hours.',note:'',createdAt:iso(-15),updatedAt:iso(-15)},
 {id:'r3',type:'rule',text:'If it’s a “maybe”, it’s a no.',note:'',createdAt:iso(-15),updatedAt:iso(-15)},
]
const settings={onboarded:true,demoLoaded:false,reduceMotion:false,name:'Sam',theme:'midnight',lockEnabled:false,pinHash:'',values:['Growth','Adventure','Security','Family','Honesty','Health']}
module.exports = async function seed(page){
  await page.evaluate(async ({scripts,decisions,rules,settings})=>{
    await new Promise((resolve,reject)=>{
      const open=indexedDB.open('receipts')
      open.onsuccess=()=>{const db=open.result;const tx=db.transaction('receipts_store','readwrite');const s=tx.objectStore('receipts_store');s.put(scripts,'scripts');s.put(decisions,'decisions');s.put(rules,'rules');s.put(settings,'settings');tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)}
      open.onerror=()=>reject(open.error)
    })
  },{scripts,decisions,rules,settings})
}
module.exports.data = {scripts,decisions,rules,settings}
