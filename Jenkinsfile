@Library('jenkins-pipeline-library@main')

String appFamily= 'microblog'
String appName = 'users-api'

//project CI/CD pipeline config
String dockerRepository = "training/${appFamily}-${appName}"
String dockerRegistry = "registry.local:5000"
String infraJob = "Training/training%2F${appFamily}-${appName}-kube"
String infraBranch = "main"
dockerPipeline([
    dockerRepository: dockerRepository,
    dockerRegistry: dockerRegistry,
    platform: "linux/amd64",
    infra: [
        job: "${infraJob}/${infraBranch}"
    ]       
])
