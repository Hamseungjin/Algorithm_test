package mil.af.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "ALR20_ACCESS_LOG")
@EntityListeners(AuditingEntityListener.class)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
public class alr20_access_log {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ACCESS_LOG_ID")
    private Long id;

    /** 접속 주체 팀 ID (로그인 전 접근 시 null 가능) */
    @Column(name = "TEAM_ID")
    private Long teamId;

    /** 접속 IP 주소 */
    @Column(name = "ACCESS_IP", nullable = false, length = 45)
    @NotNull
    private String accessIp;

    /** 요청 URI */
    @Column(name = "REQUEST_URI", nullable = false, length = 500)
    @NotNull
    private String requestUri;

    /** HTTP 메서드 (GET, POST 등) */
    @Column(name = "HTTP_METHOD", nullable = false, length = 10)
    @NotNull
    private String httpMethod;

    /** HTTP 응답 상태코드 */
    @Column(name = "HTTP_STATUS")
    private Integer httpStatus;

    @CreatedDate
    @Column(name = "ACCESS_DATETIME", nullable = false, updatable = false)
    private LocalDateTime accessDatetime;
}
