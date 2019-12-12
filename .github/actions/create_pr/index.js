const core = require('@actions/core');
const github = require('@actions/github');

try {

  const context = github.context

  console.table(context)
  console.table(context.payload)
  
  
  #var payload_pr = payload.pull_request
  #var is_merged = payload_pr.merged
  #if (!is_merged) {
  #  console.log(`This is not a merge`)
  #  return ;
  #}
}
catch (error) {
  core.setFailed(error.message);
}
~
