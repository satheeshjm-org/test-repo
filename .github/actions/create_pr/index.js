const core = require('@actions/core');
const github = require('@actions/github');
async function run() {

  try {

    //TODO: get these from config
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

    var pr_base = payload_pr.base.ref
    var pr_head = payload_pr.head.ref

    if (pr_base == production_branch && pr_head == staging_branch) {
      //dev->master
      var release_resp = await github_cli.repos.createRelease({
        owner: repo.owner,
        repo: repo.repo,
        tag_name: payload_pr.title, //TODO: change it to tag format
        name: payload_pr.title,
        body: payload_pr.body,
        draft: false,
        prerelease: false,
        target_commitish: production_branch
      });
    }
    else if (pr_base == staging_branch) {
      if (pr_head == production_branch) {
        //master->dev reverse merge
      }
      else {
        //feature->dev merge. Create Release PR

        var base = production_branch //pull from config
        var head = payload_pr.base.ref
        var log_prefix = `${head}->${base}`
        var pr_body = `${payload_pr.title}(#${payload_pr.number})`

        try {
          console.debug(`${log_prefix} Fetching pull request`)
          var prlist_resp = await github_cli.pulls.list({
            owner: repo.owner,
            repo: repo.repo,
            base: base,
            head: `${repo.owner}:${head}`,
            state: "open",
          })

          var prs = prlist_resp.data
          if (prs.length == 0) {
            console.info(`${log_prefix} Pull request not found. So creating one`)

            var prcreate_resp = await github_cli.pulls.create({
              owner: repo.owner,
              repo: repo.repo,
              base: base,
              head: head,
              title: "Release:",
              body: pr_body
            })
            console.info(`${log_prefix} Pull request created`)
          }
          else {
            var existing_pr = prs[0]

            console.info(`${log_prefix} ${prs.length} pull requests found. ${existing_pr.number}`)
            pr_body = `${existing_pr.body}\n${pr_body}`

            var prupdate_resp = await github_cli.pulls.update({
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
    }








  }
  catch (error) {
    core.setFailed(error.message);
  }

}


run()
