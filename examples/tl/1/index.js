import setupScene from './setupScene'
const {sphere} = setupScene()

// function setupTheaterForSphere(mesh) {
//   const obj = timeline.getObject('The Ball', mesh, {
//     props: {
//       opacity: {
//         type: Theater.types.number({limit: {from: 0, to: 1}}),
//         default: 1,
//       },
//     },
//   })
// }

const project = new TL.Project('Bouncing Ball Project')
// const timeline = project.getTimeline('Bouncing Ball Timeline')