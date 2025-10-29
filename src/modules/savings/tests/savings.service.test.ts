import { SavingsService } from '../savings.service';
import { SavingsRepository } from '../savings.repository';
import { UsersRepository } from '../../users/users.repository';

// Mock the repositories
jest.mock('../savings.repository');
jest.mock('../../users/users.repository');

describe('SavingsService', () => {
  let savingsService: SavingsService;
  let mockSavingsRepository: jest.Mocked<SavingsRepository>;
  let mockUsersRepository: jest.Mocked<UsersRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    savingsService = new SavingsService();

    mockSavingsRepository = (savingsService as any).repository;
    mockUsersRepository = (savingsService as any).usersRepository;
  });

  // ---------------- GET TRANSACTIONS ----------------
  describe('getTransactions', () => {
    const userId = '69010963ceff92aa0f6f4e34';

    it('should handle pagination correctly', async () => {
      mockSavingsRepository.getUserTransactions.mockResolvedValue({
        transactions: [],
        total: 25,
      });

      const result = await savingsService.getTransactions(userId, 3, 10);

      expect(mockSavingsRepository.getUserTransactions).toHaveBeenCalledWith(userId, 20, 10);
      expect(result.pagination.totalPages).toBe(3);
    });
  });

  // ---------------- GET STATS ----------------
  describe('getStats', () => {
    const userId = '69010963ceff92aa0f6f4e34';

    it('should return transaction statistics', async () => {
      const mockStats = { 
        totalDeposits: 5000, 
        depositsCount: 10, 
        totalWithdrawals: 2000, 
        withdrawalsCount: 5 
      };

      mockSavingsRepository.getTransactionStats.mockResolvedValue(mockStats);

      const result = await savingsService.getStats(userId);

      expect(mockSavingsRepository.getTransactionStats).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockStats);
    });
  });
});

