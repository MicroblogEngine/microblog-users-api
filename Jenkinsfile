@Library('jenkins-pipeline-library@main')

//project CI/CD pipeline config
String dockerRepository = "training/microblog-users-api"
String dockerRegistry = "registry.local:5000"
dockerPipeline([
    dockerRepository: dockerRepository,
    dockerRegistru: dockerRegistry,
    platform: "linux/amd64"
])
