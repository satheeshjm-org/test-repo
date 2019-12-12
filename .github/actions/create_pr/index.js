const core = require('@actions/core');
const github = require('@actions/github');


async function construct_pr_description(base_branch, head_branch) {
  var r2 = await context.github.repos.compareCommits(context.repo({
    base: base_branch,
    head: head_branch,
  }))
  var diff = r2.data
  var diff_commits = diff.commits
  if (diff_commits.length == 0) {
    //no diff
    return ""
  }
  else {
    var commit_msgs = diff_commits.map(c => c.commit.message)
    var pr_description = commit_msgs.join('\n')
    return pr_description
  }
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
          body: await construct_pr_description(base, head)
        })
        console.info(`${log_prefix} Pull request created`)
      }
      else {
        console.info(`${log_prefix} ${prs.length} pull requests found. ${prs[0].number}`)

        await github_cli.pulls.update({
          owner: repo.owner,
          repo: repo.repo,
          pull_number: prs[0].number,
          body: await construct_pr_description(base, head)
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
