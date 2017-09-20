# Promaudio
*Listen to your Prometheus metrics.*

- preact, webpack, es2016

## AWS Deployment
### Create Stack
aws --region us-east-1 cloudformation create-stack \
  --stack-name Promaudio \
  --parameters ParameterKey=Domain,ParameterValue=promaudio.5pi.de \
    ParameterKey=ValidationDomain,ParameterValue=5pi.de \
    ParameterKey=ViewerProtocolPolicy,ParameterValue=allow-all \
  --template-body "$(curl -L \
    https://raw.githubusercontent.com/latency-at/cfn-s3-cloudfront/master/site.yml)"
