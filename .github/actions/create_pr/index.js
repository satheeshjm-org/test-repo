const core = require('@actions/core');
const github = require('@actions/github');


async function construct_pr_description(github_cli, base_branch, head_branch) {


}


async function run() {

  try {

    var production_branch = "master"
    var staging_branch = "dev"

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


    var base = production_branch //pull from config
    var head = payload_pr.base.ref
    var log_prefix = `${head}->${base}`
    var pr_body = ""
    //find diff
    console.debug(`${log_prefix} comparing branches`)
    var diff_resp = await github_cli.repos.compareCommits({
      owner: repo.owner,
      repo: repo.repo,
      base: base,
      head: head,
    })
    var diff = diff_resp.data
    var diff_commits = diff.commits
    if (diff_commits.length == 0) {
      //no diff
      console.info(`${log_prefix} no diff found between branches`)
      throw new Error("No diff between branches")
    }
    else {
      console.info(`${log_prefix} got diff between branches`)
      var commit_msgs = diff_commits.map(c => c.commit.message)
      pr_body = commit_msgs.join('\n')
    }



    try {
      console.debug(`${log_prefix} Fetching pull request`)
      var resp = await github_cli.pulls.list({
        owner: repo.owner,
        repo: repo.repo,
        base: base,
        head: `${repo.owner}:${head}`,
        state: "open",
      })

      var prs = resp.data
      if (prs.length == 0) {
        console.info(`${log_prefix} Pull request not found. So creating one`)
        //calculate description
        var compare_resp = await github_cli.compareCommits({

        })
        var resp2 = await github_cli.pulls.create({
          owner: repo.owner,
          repo: repo.repo,
          base: base,
          head: head,
          title: "test",
          body: pr_body
        })
        console.info(`${log_prefix} Pull request created`)
      }
      else {
        console.info(`${log_prefix} ${prs.length} pull requests found. ${prs[0].number}`)

        await github_cli.pulls.update({
          owner: repo.owner,
          repo: repo.repo,
          pull_number: prs[0].number,
          body: pr_body
        })
        //update description
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
