@Library('jenkins-pipeline-library@0.0.1')

//project CI/CD pipeline config
String dockerRepository = "training/microblog-users-api"
String dockerRegistry = "registry.local:5000"
dockerPipeline([
    dockerRepository: dockerRepository,
    dockerRegistru: dockerRegistry,
    platform: "linux/amd64"
])
