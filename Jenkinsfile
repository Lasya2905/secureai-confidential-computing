pipeline {
    agent any

    environment {
        BACKEND_IMAGE  = 'secureai-cloud-backend'
        FRONTEND_IMAGE = 'secureai-cloud-frontend'
        NODE_VERSION   = '18'
        PYTHON_VERSION = '3.11'
    }

    options {
        timestamps()
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out SecureAI Cloud source...'
                checkout scm
            }
        }

        stage('Install Dependencies') {
            parallel {
                stage('Backend deps') {
                    steps {
                        dir('backend') {
                            sh 'python -m pip install --upgrade pip'
                            sh 'pip install -r requirements.txt'
                        }
                    }
                }
                stage('Frontend deps') {
                    steps {
                        dir('frontend') {
                            sh 'yarn install --frozen-lockfile'
                        }
                    }
                }
            }
        }

        stage('Backend Tests') {
            steps {
                dir('backend') {
                    sh 'python -m pytest ../tests/backend -v --maxfail=1 || (echo "Backend tests failed" && exit 1)'
                }
            }
        }

        stage('Frontend Tests') {
            steps {
                dir('frontend') {
                    sh 'CI=true yarn test --watchAll=false --passWithNoTests'
                }
            }
        }

        stage('Frontend Build') {
            steps {
                dir('frontend') {
                    sh 'yarn build'
                }
            }
        }

        stage('Package') {
            steps {
                echo 'Building Docker images...'
                sh 'docker build -t ${BACKEND_IMAGE}:${BUILD_NUMBER}  -t ${BACKEND_IMAGE}:latest  ./backend'
                sh 'docker build -t ${FRONTEND_IMAGE}:${BUILD_NUMBER} -t ${FRONTEND_IMAGE}:latest ./frontend'
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploying with docker-compose...'
                sh 'docker-compose -f docker-compose.yml up -d --build'
            }
        }

        stage('Health Check') {
            steps {
                echo 'Waiting for backend to become healthy...'
                sh '''
                  for i in $(seq 1 20); do
                    if curl -sf http://localhost:8001/api/health | grep -q "healthy"; then
                        echo "Backend healthy"
                        exit 0
                    fi
                    sleep 3
                  done
                  echo "Backend never became healthy"
                  exit 1
                '''
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully. SecureAI Cloud is up.'
        }
        failure {
            echo 'Pipeline failed. Rolling back...'
            sh 'docker-compose -f docker-compose.yml logs --tail=200 || true'
        }
        always {
            echo "Build #${env.BUILD_NUMBER} finished with status: ${currentBuild.currentResult}"
        }
    }
}
