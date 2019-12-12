
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
    var is_merged = payload_pr.merged
    if (!is_merged) {
     console.info(`This is not a merge`)
     return ;
    }

    var production_branch = payload_pr.base.ref
    var staging_branch = "dev"
    var pr_head = payload_pr.head.ref

    if (pr_head == staging_branch) {
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
    else {
      //hotfix. branch->master
    }
  }
  catch (error) {
    core.setFailed(error.message);
  }

}


run()
