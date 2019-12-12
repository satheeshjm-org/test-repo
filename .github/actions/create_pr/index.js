const core = require('@actions/core');
const github = require('@actions/github');


async function run() {
  
  try {

    const context = github.context
    console.log(process.env.GITHUB_TOKEN)
    console.log("l")
    const github_cli = new github.GitHub(process.env.GITHUB_TOKEN)

    const payload = context.payload

    //var payload_pr = payload.pull_request
    //var is_merged = payload_pr.merged
    //if (!is_merged) {
    //  console.log(`This is not a merge`)
    //  return ;
    //}

  //  console.table(context.payload)
     console.log(process.env.GITHUB_TOKEN)

    await github_cli.repos.createRelease({
     repo : "satheeshjm-org/test-repo",
     name : "tag",
     tag_name : "test_tag",
     body: "test",
     draft: false,
     prerelease: false,
     owner: "SatheeshJM"
    })

  }
  catch (error) {
    core.setFailed(error.message);
  }

}


run()
