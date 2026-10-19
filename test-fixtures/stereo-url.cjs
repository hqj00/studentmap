const { createHash } = require('node:crypto')
const name = 'Stereographic_projection_SW.JPG'
const md5 = createHash('md5').update(name).digest('hex')
console.log(`https://upload.wikimedia.org/wikipedia/commons/thumb/${md5[0]}/${md5.slice(0, 2)}/${name}/960px-${name}`)
