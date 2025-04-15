pipeline {
    agent any
    environment {
        // Docker Hub credentials (configured in Jenkins)
        DOCKER_CREDENTIALS_ID = 'docker-password'
        DOCKER_REPO_FE = 'thimira20/session-react-frontend'
        DOCKER_REPO_BE = 'thimira20/session-node-backend'
        // AWS credentials
        AWS_CREDENTIALS_ID = 'aws-credentials'
        // SSH key for Ansible
        SSH_CREDENTIALS_ID = 'ssh-key'
    }
    
    options {
        timeout(time: 60, unit: 'MINUTES')
    }
    
    stages {
        stage('Checkout Code') {
            steps {
                git url: 'https://github.com/Thimira20/Social_mediaApp_2.git', branch: 'main'
            }
        }
        
        stage('Build Frontend') {
            steps {
                dir('client') {
                    bat 'npm install'
                    bat 'set "CI=false" && npm run build'
                }
            }
        }
        
        stage('Build Backend') {
            steps {
                dir('backend') {
                    bat 'npm install'
                }
            }
        }
        
        stage('Cleanup Old Images') {
            steps {
                bat """
                    docker rmi %DOCKER_REPO_FE%:latest || exit 0
                    docker rmi %DOCKER_REPO_BE%:latest || exit 0
                    docker system prune -f
                """
            }
        }
        
        stage('Dockerize Frontend') {
            steps {
                dir('client') {
                    bat 'docker build -t %DOCKER_REPO_FE%:latest .'
                }
            }
        }
        
        stage('Dockerize Backend') {
            steps {
                dir('backend') {
                    bat 'docker build -t %DOCKER_REPO_BE%:latest .'
                }
            }
        }
        
        stage('Push Docker Images') {
            steps {
                script {
                    retry(3) {
                        timeout(time: 30, unit: 'MINUTES') {
                            docker.withRegistry('https://index.docker.io/v1/', DOCKER_CREDENTIALS_ID) {
                                bat 'docker push %DOCKER_REPO_FE%:latest'
                                bat 'docker push %DOCKER_REPO_BE%:latest'
                            }
                        }
                    }
                }
            }
        }
        
        stage('Terraform Init') {
            steps {
                withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', 
                                 credentialsId: AWS_CREDENTIALS_ID,
                                 accessKeyVariable: 'AWS_ACCESS_KEY_ID', 
                                 secretKeyVariable: 'AWS_SECRET_ACCESS_KEY']]) {
                    dir('terraform') {
                        bat 'terraform init'
                    }
                }
            }
        }
        
        stage('Terraform Plan') {
            steps {
                withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', 
                                 credentialsId: AWS_CREDENTIALS_ID,
                                 accessKeyVariable: 'AWS_ACCESS_KEY_ID', 
                                 secretKeyVariable: 'AWS_SECRET_ACCESS_KEY']]) {
                    dir('terraform') {
                        bat 'terraform plan -out=tfplan'
                    }
                }
            }
        }
        
        stage('Approve Infrastructure') {
            steps {
                input message: 'Do you want to apply the Terraform plan?',
                      ok: 'Apply'
            }
        }
        
        stage('Terraform Apply') {
            steps {
                withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', 
                                 credentialsId: AWS_CREDENTIALS_ID,
                                 accessKeyVariable: 'AWS_ACCESS_KEY_ID', 
                                 secretKeyVariable: 'AWS_SECRET_ACCESS_KEY']]) {
                    dir('terraform') {
                        bat 'terraform apply -auto-approve tfplan'
                        // Save the outputs to use in Ansible
                        bat 'terraform output -json > ../ansible/terraform_outputs.json'
                    }
                }
            }
        }
        
        stage('Wait For Instance') {
            steps {
                // Wait for instance to be reachable
                bat 'ping -n 30 >nul'
            }
        }
        
        stage('Ansible Setup') {
            steps {
                withCredentials([sshUserPrivateKey(credentialsId: SSH_CREDENTIALS_ID, 
                                keyFileVariable: 'SSH_KEY')]) {
                    dir('ansible') {
                        // Using Docker to run Ansible on Windows
                        bat """
                            docker run --rm -v %CD%:/ansible -v %SSH_KEY%:/id_rsa -w /ansible cytopia/ansible \
                            ansible-playbook -i inventory/aws_ec2.yml playbooks/setup.yml \
                            --private-key=/id_rsa -u ubuntu --ssh-common-args="-o StrictHostKeyChecking=no"
                        """
                    }
                }
            }
        }
        
        stage('Ansible Deploy') {
            steps {
                withCredentials([sshUserPrivateKey(credentialsId: SSH_CREDENTIALS_ID, 
                                keyFileVariable: 'SSH_KEY')]) {
                    dir('ansible') {
                        // Using Docker to run Ansible on Windows
                        bat """
                            docker run --rm -v %CD%:/ansible -v %SSH_KEY%:/id_rsa -w /ansible cytopia/ansible \
                            ansible-playbook -i inventory/aws_ec2.yml playbooks/deploy.yml \
                            --private-key=/id_rsa -u ubuntu --ssh-common-args="-o StrictHostKeyChecking=no"
                        """
                    }
                }
            }
        }
    }
    
    post {
        always {
            cleanWs()
            bat """
                docker rmi %DOCKER_REPO_FE%:latest || exit 0
                docker rmi %DOCKER_REPO_BE%:latest || exit 0
            """
        }
        success {
            echo 'Pipeline completed successfully! Application deployed to AWS EC2.'
        }
    }
}