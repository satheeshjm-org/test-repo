const core = require('@actions/core');
const github = require('@actions/github');


async function run() {

  try {

    const context = github.context
    const github_cli = new github.GitHub(process.env.GITHUB_TOKEN)

    const payload = context.payload

    var payload_pr = payload.pull_request
    if(!payload_pr) {
      throw new Error(`Payload "pull_request" missing`)
    }
    //var is_merged = payload_pr.merged
    //if (!is_merged) {
    //  core.info(`This is not a merge`)
    //  return ;
    //}

    var resp
      try {
      core.debug(`Fetching pull request ${payload_pr.number}`)
      resp = await github_cli.pulls.get({
          repo: context.repo,
          pull_number: payload_pr.number
        })
      }
      catch (e) {
        if (e.name == "HttpError" && e.status == 404) {
          core.info(`Resource not found for ${e.request.url}`)
        } else {
          core.error(e)
        }
      }


      console.table(resp)

  }
  catch (error) {
    core.setFailed(error.message);
  }

}


run()
