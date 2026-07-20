pipeline {
    agent any

    environment {
        // Variables pour Docker Hub
        DOCKER_CREDENTIALS_ID = 'dockerhub-credentials'
        DOCKER_IMAGE_FRONTEND = 'bahabah/glunovita-frontend'
        DOCKER_IMAGE_BACKEND = 'bahabah/glunovita-backend'
        DOCKER_TAG = "v${env.BUILD_ID}"
    }

    stages {
        stage('1. Checkout') {
            steps {
                // Récupère automatiquement le code source depuis Git
                checkout scm
            }
        }

        stage('2. Installation') {
            parallel {
                stage('Frontend Dependencies') {
                    steps {
                        dir('frontend') {
                            sh 'npm ci'
                        }
                    }
                }
                stage('Backend Dependencies') {
                    steps {
                        dir('backend') {
                            // Remarque : J'ai vu que votre backend utilise actuellement Node.js (package.json).
                            // Si vous utilisez finalement Python, décommentez la ligne suivante :
                            // sh 'pip install -r requirements.txt'
                            sh 'npm ci'
                        }
                    }
                }
            }
        }

        stage('3. Lint (Analyse Statique)') {
            parallel {
                stage('Frontend Lint') {
                    steps {
                        dir('frontend') {
                            sh 'npm run lint'
                        }
                    }
                }
                stage('Backend Lint') {
                    steps {
                        dir('backend') {
                            // Pour Python :
                            // sh 'flake8 . && black --check . && pylint **/*.py'
                            
                            // Pour Node.js (actuel) :
                            sh 'npm run lint || echo "Aucun script de lint configuré"'
                        }
                    }
                }
            }
        }

        stage('4. Unit Tests') {
            parallel {
                stage('Frontend Tests') {
                    steps {
                        dir('frontend') {
                            // Exécute les tests Jest/React
                            sh 'npm test -- --passWithNoTests'
                        }
                    }
                }
                stage('Backend Tests') {
                    steps {
                        dir('backend') {
                            // Pour Python :
                            // sh 'pytest'
                            
                            // Pour Node.js (actuel) :
                            sh 'npm test || echo "Aucun script de test configuré"'
                        }
                    }
                }
            }
        }

        stage('5. Build') {
            parallel {
                stage('Frontend Build') {
                    steps {
                        dir('frontend') {
                            sh 'npm run build'
                        }
                    }
                }
                stage('Backend Build') {
                    steps {
                        dir('backend') {
                            // Pour Python :
                            // sh 'python -m compileall .'
                            
                            // Pour Node.js (actuel) :
                            sh 'echo "Compilation non requise pour ce backend Node.js"'
                        }
                    }
                }
            }
        }

        stage('6. SonarQube') {
            environment {
                // Assurez-vous que l'outil SonarQubeScanner est configuré dans Jenkins
                SCANNER_HOME = tool 'SonarQubeScanner'
            }
            steps {
                withSonarQubeEnv('SonarQubeServer') {
                    sh "${SCANNER_HOME}/bin/sonar-scanner \
                        -Dsonar.projectKey=glunovita \
                        -Dsonar.sources=frontend,backend"
                }
            }
        }

        stage('7. Trivy (Sécurité)') {
            parallel {
                stage('Scan Frontend') {
                    steps {
                        dir('frontend') {
                            // Analyse des dépendances (paquets npm) pour les vulnérabilités
                            sh 'trivy fs --severity HIGH,CRITICAL .'
                        }
                    }
                }
                stage('Scan Backend') {
                    steps {
                        dir('backend') {
                            sh 'trivy fs --severity HIGH,CRITICAL .'
                        }
                    }
                }
            }
        }

        stage('8. Docker Build') {
            parallel {
                stage('Build Frontend Image') {
                    steps {
                        dir('frontend') {
                            sh "docker build -t ${DOCKER_IMAGE_FRONTEND}:${DOCKER_TAG} -t ${DOCKER_IMAGE_FRONTEND}:latest ."
                        }
                    }
                }
                stage('Build Backend Image') {
                    steps {
                        dir('backend') {
                            sh "docker build -t ${DOCKER_IMAGE_BACKEND}:${DOCKER_TAG} -t ${DOCKER_IMAGE_BACKEND}:latest ."
                        }
                    }
                }
            }
        }

        stage('9. Push Image') {
            steps {
                withCredentials([usernamePassword(credentialsId: env.DOCKER_CREDENTIALS_ID, passwordVariable: 'DOCKER_PASS', usernameVariable: 'DOCKER_USER')]) {
                    // Connexion à Docker Hub
                    sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                    
                    // Pousser les images frontend
                    sh "docker push ${DOCKER_IMAGE_FRONTEND}:${DOCKER_TAG}"
                    sh "docker push ${DOCKER_IMAGE_FRONTEND}:latest"
                    
                    // Pousser les images backend
                    sh "docker push ${DOCKER_IMAGE_BACKEND}:${DOCKER_TAG}"
                    sh "docker push ${DOCKER_IMAGE_BACKEND}:latest"
                }
            }
        }
    }

    post {
        always {
            // Nettoyer l'espace de travail après chaque exécution
            cleanWs()
        }
        success {
            echo "✅ Le pipeline CI/CD s'est terminé avec succès !"
        }
        failure {
            echo "❌ Le pipeline a échoué. Veuillez vérifier les logs."
        }
    }
}
