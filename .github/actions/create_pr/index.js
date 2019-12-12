
const core = require('@actions/core');
const github = require('@actions/github');

try {

  const context = github.context
  
  var payload_pr = payload.pull_request
  var is_merged = payload_pr.merged
  if (!is_merged) {
    console.log(`This is not a merge`)
    return ;
  
  console.log(`${payload_pr.number} is a merge`) 
} 
catch (error) {
  core.setFailed(error.message);
}
