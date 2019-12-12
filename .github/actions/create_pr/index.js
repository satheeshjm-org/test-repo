const core = require('@actions/core');
const github = require('@actions/github');


async function run() {

  try {

    const context = github.context
    const github_cli = new github.GitHub(process.env.GITHUB_TOKEN)

    const payload = context.payload
    var repo = context.repo

    var payload_pr = payload.pull_request
    if(!payload_pr) {
      throw new Error(`Payload "pull_request" missing`)
    }
    //var is_merged = payload_pr.merged
    //if (!is_merged) {
    //  console.info(`This is not a merge`)
    //  return ;
    //}


    var base = "master" //pull from config
    var head = payload_pr.base.ref
    var log_prefix = `${head}->${base}`
    try {
      console.debug(`${log_prefix} Fetching pull request`)
      var resp = await github_cli.pulls.list({
        owner: repo.owner,
        repo: repo.repo,
        base: base,
        head: head,
        state: "open"
      })

      console.table(repo)
      var prs = resp.data
      if (prs.length == 0) {
        console.info(`${log_prefix} Pull request not found. So creating one`)
        var resp2 = await github_cli.pulls.create({
          owner: repo.owner,
          repo: repo.repo,
          base: base,
          head: `${repo.org}:${head}`,
          title: "test"
        })
        console.info(`${log_prefix} Pull request created`)
      }
      else {
        console.info(`${log_prefix} ${prs.length} pull requests found. ${prs[0].number}`)
      }
    }
    catch (e) {
      console.error(e)
      throw e;
    }





  }
  catch (error) {
    core.setFailed(error.message);
  }

}


run()
