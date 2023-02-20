const fs = require("fs");
const { Client } = require('@elastic/elasticsearch')
const client = new Client({
    node: 'https://localhost:9200',
    auth: {
      apiKey: 'eDdSV1o0WUJXUzk3dlFqZi1HY2U6M1R4ZHJEcjFTT3lfTV8teU1LSGM1UQ=='
    },
    tls: {
        ca: fs.readFileSync(__dirname+'/http_ca.crt'),
        rejectUnauthorized: false
      }
});

async function run () {
    // Let's start by indexing some data
  await client.index({
    index: 'akcore-projekt_01_umfr_01_responses',
    id:"1",
    refresh: true,
    document: {
        "SuveryID": 1,
        "Department": "Zentrallogistik",
        "ParticipantID": 1,
        "Role": "Key-User",
        "PartParticipant": "yes"
      }
  })

  await client.index({
    index: 'akcore-projekt_01_umfr_02_responses',
    id:"1",
    refresh: true,
    document: {
        "SuveryID": 1,
        "Department": "Zentrallogistik",
        "ParticipantID": 1,
        "Role": "Key-User",
        "PartParticipant": "yes"
      }
  })

  // Let's search!
//   const result = await client.search({
//     index: 'akcore-projekt_01_umfr_02_responses',
//     query: {
//       match: {
//         character: 'Ned'
//       }
//     }
//   })

//   console.log(result.hits.hits)
  }
  
  run().catch(console.log);