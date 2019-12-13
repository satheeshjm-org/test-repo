const core = require('@actions/core');
const github = require('@actions/github');
async function run() {

  try {



    const context = github.context
    const github_cli = new github.GitHub(process.env.GITHUB_TOKEN)

    const payload = context.payload
    var repo = context.repo

    var staging_branch = core.getInput('staging_branch')
    var production_branch = core.getInput('production_branch')


    var payload_pr = payload.pull_request
    if(!payload_pr) {
      throw new Error(`Payload "pull_request" missing`)
    }
    var is_merged = payload_pr.merged
    if (!is_merged) {
      console.info(`This is not a merge`)
      return ;
    }

    /**
     * allowed PR : staging->master
     *  1. if base_branch is not master, dont run (this won't be needed, if you have proper conditions in the workflow config)
     *  2. if head_branch is not staging, don't run
     */
    //
    if(payload_pr.base.ref != production_branch) {
      console.info(`Require base:${production_branch} for creating a release`)
    }
    if(payload_pr.head.ref != staging_branch) {
      console.info(`Require head:${staging_branch} for creating a release`)
      return
    }



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
  catch (error) {
    core.setFailed(error.message);
  }

}


run()
