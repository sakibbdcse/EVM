#include <iostream>
#include <string>
#include <vector>
#include <map>
#include <fstream>
#include <ctime>

using namespace std;

// Enumeration for menu options
enum MenuOption {
    REGISTER_VOTER = 1,
    CAST_VOTE,
    ADMIN_LOGIN,
    VIEW_RESULTS,
    EXIT
};

struct Candidate {
    string name;
    int voteCount;

    Candidate(string n) : name(n), voteCount(0) {}
};

time_t votingStartTime;
time_t votingEndTime;
int maxVotesPerCandidate = 10;

// Function to display candidates
void displayCandidates(const vector<Candidate>& candidates) {
    cout << "\nAvailable Candidates:\n";
    for (int i = 0; i < candidates.size(); ++i) {
        cout << i + 1 << ". " << candidates[i].name << " (" << candidates[i].voteCount << " votes)\n";
    }
}

// Function to display voting results
void displayResults(const vector<Candidate>& candidates) {
    cout << "\nVoting Results:\n";
    for (const auto& candidate : candidates) {
        cout << candidate.name << ": " << candidate.voteCount << " votes\n";
    }
}

// Check if voting is open
bool isVotingOpen() {
    time_t now = time(0);
    return now >= votingStartTime && now <= votingEndTime;
}

// Save voting data to a file
void saveVotingData(const vector<Candidate>& candidates) {
    ofstream outFile("voting_results.txt");
    if (outFile.is_open()) {
        for (const auto& candidate : candidates) {
            outFile << candidate.name << ": " << candidate.voteCount << " votes\n";
        }
        outFile.close();
        cout << "Voting data saved successfully.\n";
    } else {
        cout << "Error saving voting data.\n";
    }
}

// Load candidates from a file
void loadCandidatesFromFile(vector<Candidate>& candidates) {
    ifstream inFile("candidates.txt");
    if (!inFile.is_open()) {
        cout << "Error: 'candidates.txt' not found. Please ensure the file exists.\n";
        return;
    }

    string name;
    while (getline(inFile, name)) {
        if (!name.empty()) {
            candidates.push_back(Candidate(name));
        }
    }
    inFile.close();
}

// Admin authentication
bool authenticateAdmin() {
    const string adminUsername = "admin";
    const string adminPassword = "admin123";
    string username, password;

    cout << "Enter admin username: ";
    cin >> username;
    cout << "Enter admin password: ";
    cin >> password;

    return username == adminUsername && password == adminPassword;
}

// Add a new candidate
void addCandidate(vector<Candidate>& candidates) {
    string candidateName;
    cout << "Enter the name of the new candidate: ";
    cin.ignore();
    getline(cin, candidateName);

    candidates.push_back(Candidate(candidateName));
    cout << "Candidate added successfully.\n";

    ofstream outFile("candidates.txt", ios::app);
    if (outFile.is_open()) {
        outFile << candidateName << endl;
        outFile.close();
    }
}

// Remove a candidate
void removeCandidate(vector<Candidate>& candidates) {
    int candidateNumber;
    displayCandidates(candidates);

    cout << "\nEnter the candidate number to remove: ";
    cin >> candidateNumber;

    if (candidateNumber < 1 || candidateNumber > candidates.size()) {
        cout << "Invalid candidate number.\n";
        return;
    }

    candidates.erase(candidates.begin() + candidateNumber - 1);
    cout << "Candidate removed successfully.\n";

    ofstream outFile("candidates.txt");
    if (outFile.is_open()) {
        for (const auto& candidate : candidates) {
            outFile << candidate.name << endl;
        }
        outFile.close();
    }
}

// Register a new voter
void registerVoter(map<string, string>& voterCredentials) {
    string username, password;
    cout << "Enter a new voter username: ";
    cin >> username;
    cout << "Enter a new voter password: ";
    cin >> password;

    voterCredentials[username] = password;
    cout << "Voter registered successfully!\n";
}

// Main program
int main() {
    vector<Candidate> candidates;
    map<string, string> voterCredentials;
    int choice;

    loadCandidatesFromFile(candidates);

    votingStartTime = time(0);
    votingEndTime = votingStartTime + 3600; // Voting duration: 1 hour

    cout << "Welcome to the Online Voting System\n";

    while (true) {
        cout << "\n1. Register Voter\n2. Vote\n3. Admin Login\n4. View Results\n5. Exit\n";
        cout << "Please select an option: ";
        cin >> choice;

        switch (choice) {
            case REGISTER_VOTER:
                registerVoter(voterCredentials);
                break;

            case CAST_VOTE: {
                if (!isVotingOpen()) {
                    cout << "Voting is closed. Please try again later.\n";
                    break;
                }

                string username, password;
                cout << "Enter your username: ";
                cin >> username;
                cout << "Enter your password: ";
                cin >> password;

                if (voterCredentials.find(username) == voterCredentials.end() || voterCredentials[username] != password) {
                    cout << "Invalid credentials.\n";
                    break;
                }

                displayCandidates(candidates);
                cout << "Enter your vote (1-" << candidates.size() << "): ";
                cin >> choice;

                if (choice < 1 || choice > candidates.size()) {
                    cout << "Invalid candidate number.\n";
                    break;
                }

                if (candidates[choice - 1].voteCount >= maxVotesPerCandidate) {
                    cout << "This candidate has reached the maximum vote limit.\n";
                    break;
                }

                candidates[choice - 1].voteCount++;
                cout << "Thank you for voting!\n";
                break;
            }

            case ADMIN_LOGIN:
                if (authenticateAdmin()) {
                    int adminChoice;
                    cout << "\nAdmin Menu:\n";
                    cout << "1. Add Candidate\n2. Remove Candidate\n3. Save Results\n";
                    cout << "Enter your choice: ";
                    cin >> adminChoice;

                    switch (adminChoice) {
                        case 1:
                            addCandidate(candidates);
                            break;
                        case 2:
                            removeCandidate(candidates);
                            break;
                        case 3:
                            saveVotingData(candidates);
                            break;
                        default:
                            cout << "Invalid choice.\n";
                    }
                } else {
                    cout << "Admin authentication failed.\n";
                }
                break;

            case VIEW_RESULTS:
                displayResults(candidates);
                break;

            case EXIT:
                cout << "Exiting the system. Goodbye!\n";
                return 0;

            default:
                cout << "Invalid option. Please try again.\n";
        }
    }
}
