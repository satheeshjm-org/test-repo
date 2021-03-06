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


    //calculate body
    var release_body = `${payload_pr.title}(#${payload_pr.number})\n\n${payload_pr.body}`

    //calculate tag
    const pr_title = payload_pr.title //title will be of the format Release: x.x.x.x
    const regex_match = pr_title.match(/^Release:((\d+\.){3}\d+)$/m) //todo: move this to inputs
    if(!regex_match) {
      throw new Error(`Invalid Title. Expected format "Release:x.x.x.x" Actual value ${pr_title} `)
    }
    var release_tag = regex_match[1]


    var existing_release
    try {
      console.debug(`Getting release by tag : ${release_tag}`)
      var getrelease_resp = await github_cli.repos.getReleaseByTag({
        owner: repo.owner,
        repo: repo.repo,
        tag: release_tag,
      })
      console.debug(`Got release for tag : ${release_tag}`)
      existing_release = getrelease_resp.data
    }
    catch (e) {
      if (e.name == "HttpError" && e.status == 404) {
        console.info(`Resource not found for ${e.request.url}`)
      }
      else {
        throw e
      }
    }

    if (!existing_release) {
      console.debug(`Creating release for tag : ${release_tag}`)
      var createrelease_resp = await github_cli.repos.createRelease({
        owner: repo.owner,
        repo: repo.repo,
        tag_name: release_tag,
        name: payload_pr.title,
        body: payload_pr.body,
        draft: false,
        prerelease: false,
        target_commitish: production_branch
      });
      console.debug(`Created release for tag : ${release_tag}`)
    }
    else {
      throw new Error(`Release tag exists`)

    }

  }
  catch (error) {
    core.setFailed(error.message);
  }

}


run()
